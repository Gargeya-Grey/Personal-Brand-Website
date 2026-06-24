import { Metadata } from 'next';
import AboutClient from './about-client';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about Gargeya Sharma, Lead Architect and Engineer specializing in scalable systems and AI.',
};

export default function AboutPage() {
  return <AboutClient />;
}
