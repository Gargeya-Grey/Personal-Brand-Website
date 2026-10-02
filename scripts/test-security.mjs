import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import sharp from 'sharp';
import { PGlite } from '@electric-sql/pglite';

// No live credentials, provider requests, application data, or mail delivery.
Object.assign(process.env, { NODE_ENV:'production', VERCEL:'1', JWT_SECRET:'security-regression-secret-only-123456',
  ALLOWED_EMAILS:'owner@example.com', RESEND_API_KEY:'test-only', RESEND_SEGMENT_ID:'test-segment',
  NEXT_PUBLIC_SUPABASE_URL:'https://security-test.invalid', SUPABASE_SERVICE_ROLE_KEY:'test-only', APP_URL:'https://site.example' });
const db = new PGlite();
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
await db.exec(await fs.readFile(new URL('../data/sql/security_intake.sql',import.meta.url),'utf8'));
await db.exec(`create table public.newsletter_weeks(id text primary key,week_of date,stage text,payload jsonb,created_at timestamptz,updated_at timestamptz);
  create table public.x_content_packs(id text primary key,date date,title text,theme text,planned_minutes integer,payload jsonb,created_at timestamptz,updated_at timestamptz);
  grant all on public.newsletter_weeks,public.x_content_packs to service_role;`);
await db.exec('set role service_role');
const calls = [];
let emailFailure = false;
let providerSuppressed = true;
let contactExists = true;
let raceHook;
let localSubscriber = { email:'left@example.com', timezone:'UTC', source:'unsubscribe', unsubscribed:true, unsubscribed_at:'2026-01-01' };
globalThis.fetch = async (input, init={}) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  const method = init.method || 'GET';
  const body = init.body ? JSON.parse(init.body) : null;
  calls.push({url:url.href, method, body, headers:init.headers});
  const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
  if (url.hostname === 'security-test.invalid') {
    if (url.pathname.endsWith('/rpc/security_admit_intake')) {
      const result = await db.query('select public.security_admit_intake($1,$2,$3,$4) as value',
        [body.p_client,body.p_email,body.p_request,body.p_weight]);
      return json(result.rows[0].value);
    }
    if (url.pathname.endsWith('/rpc/security_consume_token')) {
      const result = await db.query('select public.security_consume_token($1,$2) as value',[body.p_digest,body.p_expires_at]);
      return json(result.rows[0].value);
    }
    if (url.pathname.endsWith('/rpc/security_ingest_cas')) {
      if (raceHook) { const hook=raceHook; raceHook=null; await hook(); }
      const result=await db.query('select public.security_ingest_cas($1,$2,$3,$4) as value',
        [body.p_table,body.p_id,body.p_expected,body.p_next]);
      return json(result.rows[0].value);
    }
    if (url.pathname.endsWith('/newsletter_subscribers')) {
      if (method === 'GET') return json([localSubscriber]);
      if (!new Headers(init.headers).get('prefer')?.includes('ignore-duplicates')) localSubscriber={...localSubscriber,...body};
      return new Response(null,{status:204});
    }
    if (url.pathname.endsWith('/security_requests') && method==='DELETE') {
      await db.query('delete from public.security_requests where digest=$1',[url.searchParams.get('digest').slice(3)]);
      return new Response(null,{status:204});
    }
    for (const table of ['newsletter_weeks','x_content_packs']) {
      if (url.pathname.endsWith('/'+table) && method==='GET') {
        const id=url.searchParams.get('id')?.slice(3);
        return json((await db.query(`select * from public.${table} where id=$1`,[id])).rows);
      }
    }
  }
  if (url.hostname === 'api.resend.com') {
    if (url.pathname === '/emails' && method==='POST') return emailFailure ? json({message:'test failure'},422) : json({id:randomUUID()});
    if (url.pathname === '/contacts' && method==='GET') return json({data:[{id:'left-id',email:'left@example.com',unsubscribed:providerSuppressed}]});
    if (url.pathname === '/contacts' && method==='POST') return contactExists ? json({message:'exists'},409) : json({id:'new-contact'});
    if (url.pathname.startsWith('/contacts/') && method==='GET') return json({id:'left-id',email:'left@example.com',unsubscribed:providerSuppressed});
    if (url.pathname.startsWith('/contacts/') && method==='PATCH') { providerSuppressed=body.unsubscribed; return json({id:'left-id'}); }
  }
  throw new Error(`Unmocked outbound request: ${method} ${url.origin}${url.pathname}`);
};
const auth = await import('../lib/auth.ts');
const ticket = await import('../lib/sign-in-ticket.ts');
const model = await import('../lib/newsletter-model.ts');
const send = await import('../lib/newsletter-send.ts');
const confirm = await import('../lib/newsletter-confirmation.ts');
const service = await import('../lib/newsletter-service.ts');
const x = await import('../lib/x-content-service.ts');
const pdf = await import('../lib/ledger-pdf-client.ts');
const images = await import('../lib/cover-images.ts');
const signup = await import('../app/api/subscribe/route.ts');
const confirmRoute = await import('../app/api/subscribe/confirm/route.ts');
const contact = await import('../app/api/contact/route.ts');
const finalize = await import('../app/api/auth/finalize/route.ts');
const req = (endpoint,body,client='client-1') => new Request(`https://site.example${endpoint}`,{method:'POST',
  headers:{'Content-Type':'application/json',Origin:'https://site.example','x-vercel-forwarded-for':client},body:JSON.stringify(body)});
const resetBudget = () => db.exec('truncate public.security_budgets, public.security_requests');
const user={email:'owner@example.com',name:'Owner',picture:''};

const sessionCookies = await import('../lib/session-cookie.ts');
const previousCookieDomain = process.env.COOKIE_DOMAIN;
const previousAppUrl = process.env.APP_URL;
try {
  process.env.APP_URL = 'https://www.sgargeya.com';
  for (const domain of [undefined, '.sgargeya.com']) {
    if (domain === undefined) delete process.env.COOKIE_DOMAIN;
    else process.env.COOKIE_DOMAIN = domain;
    for (const host of ['preview.vercel.app', 'PREVIEW.VERCEL.APP.', 'branch-alias.vercel.app', 'localhost', '127.0.0.1']) {
      const url = `https://${host}/api/auth/finalize`;
      assert.equal(sessionCookies.getSessionCookieOptions(60, url).domain, undefined);
      assert.equal(sessionCookies.getOauthCookieOptions(url).domain, undefined);
      assert.equal(sessionCookies.getSessionCookieOptions(undefined, url).maxAge, 60 * 60 * 24 * 30);
      assert.equal(sessionCookies.getOauthCookieOptions(url).maxAge, 600);
      const response = new (await import('next/server')).NextResponse();
      sessionCookies.setAuthSessionCookie(response, 'test-only', url);
      sessionCookies.setOauthCookie(response, 'oauth_state', 'test-only', url);
      assert.doesNotMatch(response.headers.get('set-cookie'), /Domain=/i);
      sessionCookies.clearAuthSessionCookies(response, url);
      sessionCookies.clearOauthCookies(response, url);
      assert.doesNotMatch(response.headers.get('set-cookie'), /Domain=/i);
    }
    for (const host of ['sgargeya.com', 'www.sgargeya.com']) {
      assert.equal(sessionCookies.getSessionCookieOptions(60, `https://${host}`).domain, 'sgargeya.com');
      assert.equal(sessionCookies.getOauthCookieOptions(`https://${host}`).domain, 'sgargeya.com');
    }
  }
  process.env.COOKIE_DOMAIN = '.custom.example';
  assert.equal(sessionCookies.resolveCookieDomain('https://www.custom.example'), 'custom.example');
} finally {
  if (previousCookieDomain === undefined) delete process.env.COOKIE_DOMAIN;
  else process.env.COOKIE_DOMAIN = previousCookieDomain;
  if (previousAppUrl === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = previousAppUrl;
}
console.log('PASS: host-only preview session/OAuth cookies and production domain precedence');

for (const value of ['/\\attacker.example/x','//attacker.example','/\t/attacker.example','https://attacker.example','\\attacker.example','/a/..//attacker.example/path','/a/%2e%2e//attacker.example/path']) {
  assert.equal(auth.sanitizeRedirect(value),'/editorial');
}
for (const value of ['/ledger','/editorial?workspace=notes','/journal/post#section']) assert.equal(auth.sanitizeRedirect(value),value);
const session = await auth.signJWT(user);
assert.equal((await finalize.POST(req('/api/auth/finalize',{ticket:session}))).status,401);
assert.equal((await auth.verifyJWT(session)).email,user.email);
const signIn = await ticket.createSignInTicket(user);
assert.equal(await auth.verifyJWT(signIn),null,'sign-in ticket cannot become a session');
const finishes=await Promise.all([finalize.POST(req('/api/auth/finalize',{ticket:signIn})),finalize.POST(req('/api/auth/finalize',{ticket:signIn}))]);
assert.deepEqual(finishes.map(r=>r.status).sort(),[200,401]);
assert.ok(finishes.find(r=>r.status===200).headers.get('set-cookie')?.includes('auth_session='));
const expired=await auth.signJWT({...user,purpose:'sign-in',nonce:randomUUID(),exp:Math.floor(Date.now()/1000)-1});
assert.equal(await ticket.consumeSignInTicket(expired),null);
console.log('PASS: redirect variants, ordinary sessions, purpose isolation, sign-in expiry, concurrent replay');

let week=model.emptyWeek('2026-10-04');
const malicious={...week,title:'Unreviewed',bodyMd:'Draft',autoPublish:true,acknowledgedAt:'forged',stage:'sending',
  sentTo:[{email:'reader@example.com',sentAt:new Date().toISOString()}],resendBroadcastIds:['forged'],sentAt:'forged',completedAt:'forged',events:[{kind:'acknowledged',at:'forged'}]};
const fresh=model.mergeIngest(null,malicious);
assert.equal(fresh.stage,'draft'); assert.equal(fresh.autoPublish,false); assert.equal(fresh.acknowledgedAt,null);
assert.deepEqual(fresh.sentTo,[]); assert.deepEqual(fresh.resendBroadcastIds,[]); assert.deepEqual(fresh.events,[]);
assert.equal(fresh.sentAt,null); assert.equal(fresh.completedAt,null); assert.equal(model.canRelease(fresh),false); assert.equal(model.publicWeek(fresh),false);
for(const stage of ['sent','sending','skipped']) assert.deepEqual(model.mergeIngest({...fresh,stage},malicious),{...fresh,stage});
week=model.acknowledge({...fresh,title:'Approved',bodyMd:'Owner-approved body',links:[{label:'Kept',url:'https://example.com',kind:'source'}]});
const approved=model.mergeIngest(week,malicious);
assert.equal(approved.bodyMd,week.bodyMd); assert.equal(approved.title,week.title); assert.deepEqual(approved.links,week.links);
assert.equal(approved.draftMd,'Draft'); assert.equal(model.canRelease(approved),true);
const edited = model.applyCuratorEdit(fresh,{bodyMd:'Owner edit',title:'Owner title'});
const poisoned = model.mergeIngest(edited,{...malicious,draftMd:'Owner edit'});
const second = model.mergeIngest(poisoned,{...malicious,bodyMd:'Attack',draftMd:'Attack'});
assert.equal(second.bodyMd,'Owner edit'); assert.equal(second.title,'Owner title');
for(const fail of [false,true]) {
  emailFailure=fail; const start=calls.length;
  const result=await send.sendWeekNow(fresh,{onlyEmail:'owner@example.com'});
  assert.deepEqual(result.week,fresh); assert.equal(result.complete,false); assert.equal(result.sent,fail?0:1);
  assert.deepEqual(calls.slice(start).map(c=>new URL(c.url).pathname),['/emails']);
}
emailFailure=false;
console.log('PASS: forged release state, public-stage and sent-issue rewrites, approved content preservation, private test success/failure');

const items=[{id:'a',status:'posted'},{id:'b',status:'skipped'},{id:'c',status:'posted'},{id:'new',status:'skipped'}];
const merged=x.mergePreservedDraftStatuses(items,[{id:'pack-test__a',status:'posted'},{id:'b',status:'skipped'},{id:'c',status:'ready'}],'pack-test');
assert.deepEqual(merged.map(d=>d.status),['posted','skipped','ready','ready']);
assert.deepEqual(x.mergePreservedDraftStatuses(items,[],'pack-test').map(d=>d.status),['ready','ready','ready','ready']);
const omitted=x.mergePreservedDraftStatuses([],[{id:'a',status:'posted'}],'pack-test');
assert.equal(x.mergePreservedDraftStatuses([{id:'a',status:'ready'}],omitted,'pack-test')[0].status,'posted');
console.log('PASS: scout lifecycle injection and prefixed identities');
const dbWeek=await service.ingestNewsletterWeek({...fresh,id:'race-week'});
raceHook=async()=>{ const owner={...dbWeek,stage:'sent',bodyMd:'Owner published',sentAt:new Date().toISOString()};
  await db.query('update public.newsletter_weeks set stage=$1,payload=$2 where id=$3',['sent',owner,'race-week']); };
const racedWeek=await service.ingestNewsletterWeek({...malicious,id:'race-week',bodyMd:'Overwrite'});
assert.equal(racedWeek.stage,'sent'); assert.equal(racedWeek.bodyMd,'Owner published');
const pack={id:'race-pack',date:new Date().toISOString().slice(0,10),title:'Draft pack',drafts:[{id:'draft-1',kind:'original',label:'Post',body:'Original',status:'posted',priority:1}],signals:[],schedule:[],skipList:[]};
const newPack=await x.upsertXContentPack(pack,{preserveStatuses:false});
assert.equal(newPack.drafts[0].status,'ready');
raceHook=async()=>{const owner={...newPack,drafts:newPack.drafts.map(d=>({...d,status:'posted'}))};
  await db.query('update public.x_content_packs set payload=$1 where id=$2',[owner,pack.id]);};
const racedPack=await x.upsertXContentPack({...pack,drafts:[{...pack.drafts[0],status:'skipped'}]},{preserveStatuses:false});
assert.equal(racedPack.drafts[0].status,'posted');
const omittedPack=await x.upsertXContentPack({...pack,drafts:[]},{preserveStatuses:false});
const restoredPack=await x.upsertXContentPack(pack,{preserveStatuses:false});
assert.equal(omittedPack.drafts[0].status,'posted'); assert.equal(restoredPack.drafts[0].status,'posted');
console.log('PASS: actual ingest fresh-state reads and CAS retries preserve concurrent publication and posted status');

for(const type of ['text/html','image/svg+xml']) await assert.rejects(pdf.validateInvoiceFile(new File(['%PDF-<script>bad</script>'],'invoice.pdf',{type})),/incompatible/);
await assert.rejects(pdf.validateInvoiceFile(new File(['<html>bad</html>'],'invoice.pdf',{type:'application/pdf'})),/valid PDF/);
const validPdf=await pdf.validateInvoiceFile(new File(['%PDF-1.7\nminimal-header'],'invoice.pdf'));
assert.equal(validPdf.type,'application/pdf'); assert.equal(pdf.fileLooksLikePdf(validPdf),true);
assert.equal(await pdf.validateInvoiceFile(new File(['image'],'invoice.png',{type:'image/png'})).then(f=>f.type),'image/png');
const ledgerSource=await fs.readFile(new URL('../components/ledger/ledger-client.tsx',import.meta.url),'utf8');
assert.equal(ledgerSource.includes('<iframe'),false,'raw active document has no preview sink');
for(const bytes of [Buffer.from('<html><script>bad</script></html>'),Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>bad</script></svg>')]) await assert.rejects(images.canonicalCoverImage(bytes),/upload/);
const raster=await sharp({create:{width:8,height:8,channels:4,background:'#abc'}}).png().toBuffer();
const encoded=await images.canonicalCoverImage(Buffer.concat([raster,Buffer.from('<script>bad</script>')]));
assert.equal((await sharp(encoded).metadata()).format,'webp'); assert.equal(encoded.includes(Buffer.from('<script>')),false);
await assert.rejects(images.canonicalCoverImage(Buffer.from([255,216,255,0,0,0])));
const fixtureRoot=process.env.SECURITY_TEST_TMP;
assert.ok(fixtureRoot,'Set SECURITY_TEST_TMP to the prepared disposable artifact directory');
const fixture=path.join(fixtureRoot,'cover-fixtures');
await fs.mkdir(path.join(fixture,'public','covers'),{recursive:true});
await fs.mkdir(path.join(fixture,'data','cover-uploads'),{recursive:true});
await fs.writeFile(path.join(fixture,'private.txt'),'retain');
await images.deleteOwnedLocalCover('/covers/../../private.txt',fixture);
await images.deleteOwnedLocalCover('/covers/%2e%2e/%2e%2e/private.txt',fixture);
assert.equal(await fs.readFile(path.join(fixture,'private.txt'),'utf8'),'retain');
const filename=`cover-${randomUUID()}.webp`;
await fs.writeFile(path.join(fixture,'public','covers',filename),encoded);
await images.deleteOwnedLocalCover(`/covers/${filename}`,fixture);
assert.ok(await fs.stat(path.join(fixture,'public','covers',filename)),'unknown files retained');
await fs.writeFile(path.join(fixture,'data','cover-uploads',filename+'.json'),JSON.stringify({digest:createHash('sha256').update(encoded).digest('hex')}));
await images.deleteOwnedLocalCover(`/covers/${filename}?v=1`,fixture);
await assert.rejects(fs.stat(path.join(fixture,'public','covers',filename)),/ENOENT/);
const junctionRoot=path.join(fixtureRoot,`junction-fixture-${randomUUID()}`);
const junctionTarget=path.join(fixtureRoot,`junction-target-${randomUUID()}`);
await fs.mkdir(path.join(junctionRoot,'public'),{recursive:true});
await fs.mkdir(path.join(junctionRoot,'data','cover-uploads'),{recursive:true});
await fs.mkdir(junctionTarget,{recursive:true});
const linkedName=`cover-${randomUUID()}.webp`;
await fs.writeFile(path.join(junctionTarget,linkedName),encoded);
await fs.writeFile(path.join(junctionRoot,'data','cover-uploads',linkedName+'.json'),JSON.stringify({digest:createHash('sha256').update(encoded).digest('hex')}));
await fs.symlink(junctionTarget,path.join(junctionRoot,'public','covers'),process.platform==='win32'?'junction':'dir');
await images.deleteOwnedLocalCover(`/covers/${linkedName}`,junctionRoot);
assert.ok(await fs.stat(path.join(junctionTarget,linkedName)),'junction target retained');
console.log('PASS: contradictory PDF MIME, byte validation, raster decode/re-encode, traversal, ownership, normal cleanup');

await service.upsertSubscriberTimezone({email:'left@example.com',timezone:'UTC',source:'site'});
assert.equal(localSubscriber.unsubscribed,true); assert.equal(localSubscriber.source,'unsubscribe');
await resetBudget();
const before=calls.length;
const signupResult=await signup.POST(req('/api/subscribe',{email:'LEFT@example.com',timezone:'UTC'}));
assert.equal(signupResult.status,200); assert.equal(localSubscriber.unsubscribed,true); assert.equal(providerSuppressed,true);
assert.deepEqual(calls.slice(before).map(c=>new URL(c.url).pathname),['/rest/v1/rpc/security_admit_intake','/emails']);
const sentConfirmation=calls.findLast(c=>new URL(c.url).pathname==='/emails').body;
const url=new URL(sentConfirmation.text.match(/https:\/\/\S+/)[0]);
const confirmationToken=url.searchParams.get('token');
assert.equal(confirm.readNewsletterConfirmation(confirmationToken).email,'left@example.com');
assert.equal(confirm.readNewsletterConfirmation(confirmationToken+'x'),null);
const form=new FormData(); form.set('token',confirmationToken);
const confirmationResponse=await confirmRoute.POST(new Request('https://site.example/api/subscribe/confirm',{
  method:'POST',headers:{Origin:'https://site.example','x-vercel-forwarded-for':'confirmation-client'},body:form}));
assert.equal(confirmationResponse.status,303); assert.equal(localSubscriber.unsubscribed,false); assert.equal(providerSuppressed,false);
assert.ok(calls.filter(c=>new URL(c.url).hostname==='api.resend.com').length-calls.slice(0,before).filter(c=>new URL(c.url).hostname==='api.resend.com').length <= 7,'confirmation plus its email fits reserved cost');
assert.equal(await confirm.consumeNewsletterConfirmation(confirmationToken),null,'confirmation replay denied');
const expiryToken=confirm.createNewsletterConfirmation('reader@example.com','UTC','site');
const realNow=Date.now; Date.now=()=>realNow()+31*60000;
assert.equal(confirm.readNewsletterConfirmation(expiryToken),null); Date.now=realNow;
console.log('PASS: unverified suppression preservation, mailbox-bound consent, activation, tampering, expiry and replay');
await resetBudget(); contactExists=false;
const freshToken=confirm.createNewsletterConfirmation('new@example.com','UTC','site');
const freshForm=new FormData(); freshForm.set('token',freshToken);
const welcomeStart=calls.length;
const freshConfirmation=await confirmRoute.POST(new Request('https://site.example/api/subscribe/confirm',{
  method:'POST',headers:{Origin:'https://site.example'},body:freshForm}));
assert.equal(freshConfirmation.status,303);
assert.equal(calls.slice(welcomeStart).filter(c=>new URL(c.url).pathname==='/emails').length,1,'new confirmed subscriber still gets a welcome email');
contactExists=true;

await resetBudget(); const providerBefore=calls.filter(c=>new URL(c.url).hostname==='api.resend.com').length;
const results=await Promise.all(Array.from({length:15},(_,n)=>contact.POST(req('/api/contact',{
  name:'Reader',email:`reader${n}@example.com`,projectType:'other',details:`Legitimate contact message number ${n}`},`client-${n}`))));
assert.equal(results.filter(r=>r.status===200).length,10); assert.equal(results.filter(r=>r.status===429).length,5);
assert.equal(calls.filter(c=>new URL(c.url).hostname==='api.resend.com').length-providerBefore,10);
await resetBudget(); const duplicateBody={email:'repeat@example.com'};
await signup.POST(req('/api/subscribe',duplicateBody)); const duplicateStart=calls.length;
await signup.POST(req('/api/subscribe',duplicateBody));
assert.equal(calls.slice(duplicateStart).filter(c=>new URL(c.url).hostname==='api.resend.com').length,0);
console.log('PASS: route-level shared provider ceiling, varied clients/addresses, no outbound work after denial or duplicate');
await resetBudget(); emailFailure=true;
assert.equal((await signup.POST(req('/api/subscribe',{email:'retry@example.com'}))).status,502);
emailFailure=false; const retryStart=calls.length;
assert.equal((await signup.POST(req('/api/subscribe',{email:'retry@example.com'}))).status,200);
assert.equal(calls.slice(retryStart).filter(c=>new URL(c.url).pathname==='/emails').length,1,'failed delivery permits a real retry');
const realClock=Date.now; Date.now=()=>realClock()+31*60000;
const expiredRetry=calls.length;
assert.equal((await signup.POST(req('/api/subscribe',{email:'repeat@example.com'}))).status,200);
assert.equal(calls.slice(expiredRetry).filter(c=>new URL(c.url).pathname==='/emails').length,1,'expired link can be replaced');
Date.now=realClock;
console.log('PASS: failed-email and expired-link recovery without unbounded provider retries');
await db.close();
const localRoot=path.join(fixtureRoot,`local-state-fixtures-${randomUUID()}`);
await fs.mkdir(localRoot,{recursive:true});
const childEnv={...process.env,VERCEL:'',NEXT_PUBLIC_SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:''};
const runChild=(expression)=>new Promise((resolve,reject)=>{
  const source=`import * as state from ${JSON.stringify(new URL('../lib/security-state.ts',import.meta.url).href)}; console.log(await (${expression}));`;
  const child=spawn(process.execPath,['--experimental-strip-types','--disable-warning=ExperimentalWarning','--import',
    new URL('./security-test-register.mjs',import.meta.url).href,'--input-type=module','--eval',source],{cwd:localRoot,env:childEnv});
  let output='',errors=''; child.stdout.on('data',chunk=>output+=chunk); child.stderr.on('data',chunk=>errors+=chunk);
  child.on('error',reject); child.on('exit',code=>code===0?resolve(output.trim()):reject(new Error(errors)));
});
const localNonce=randomUUID();
const localTokens=await Promise.all(Array.from({length:6},()=>runChild(`state.consumeSecurityToken('${localNonce}',Date.now()+60000)`)));
assert.equal(localTokens.filter(value=>value==='true').length,1,'self-hosted one-use state survives independent processes');
const localAdmissions=await Promise.all(Array.from({length:8},(_,n)=>runChild(`state.admitPublicIntake(new Request('https://site.example'), 'local${n}@example.com', 'request-${randomUUID()}', 1)`)));
assert.equal(localAdmissions.filter(value=>value==='allowed').length,5,'self-hosted admission is shared across processes');
console.log('PASS: self-hosted production token replay and admission across independent processes');
