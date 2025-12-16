import React from 'react';
import { 
  Terminal, 
  Cpu, 
  Settings, 
  Code2, 
  TestTube, 
  Quote,
  Share2,
  ShieldCheck // New Icon for Security
} from 'lucide-react';

export const CODING_DATA = [
  {
    id: 'platform',
    title: 'Platform',
    icon: <Share2 size={20} />,
    description: 'Target environment',
    subcategories: [
      { name: 'Repository', options: ['GitHub', 'GitLab', 'Bitbucket'] },
      { name: 'Deployment', options: ['Vercel', 'Netlify', 'AWS Lambda', 'Docker', 'Kubernetes'] },
      { name: 'Community', options: ['Stack Overflow', 'Dev.to', 'Gist'] }
    ]
  },
  {
    id: 'language',
    title: 'Stack & Libraries', // RENAMED: Broader scope
    icon: <Terminal size={20} />,
    description: 'Tech Stack',
    subcategories: [
      { name: 'Core Languages', options: ['Python', 'TypeScript', 'JavaScript', 'Rust', 'Go', 'Solidity', 'SQL'] },
      { name: 'Frontend', options: ['React', 'Next.js', 'Vue', 'Svelte', 'Tailwind CSS', 'Three.js'] },
      { name: 'Backend/Data', options: ['Node.js', 'Django', 'FastAPI', 'Supabase', 'PostgreSQL', 'Pandas', 'PyTorch'] },
      { name: 'Web3', options: ['sCrypt (Bitcoin)', 'Ethers.js', 'Hardhat', 'Wagmi'] }
    ]
  },
  {
    id: 'security',
    title: 'Security Standard', // NEW: Critical for Pro users
    icon: <ShieldCheck size={20} />,
    description: 'Safety protocols',
    subcategories: [
      { name: 'Web Standards', options: ['OWASP Top 10', 'Sanitize Inputs', 'Prevent SQL Injection', 'CSP (Content Security Policy)'] },
      { name: 'Smart Contracts', options: ['Checks-Effects-Interactions', 'Reentrancy Guard', 'Access Control (Ownable)', 'Gas Optimization'] },
      { name: 'Data', options: ['GDPR Compliance', 'Encryption at Rest', 'Zero Trust'] }
    ]
  },
  {
    id: 'framework_version',
    title: 'Version',
    icon: <Code2 size={20} />,
    description: 'Specific Versions',
    subcategories: [
      { name: 'Web', options: ['React 18', 'React 19 (Server Actions)', 'Next.js 14', 'Vue 3'] },
      { name: 'Python', options: ['Python 3.11', 'Python 3.12'] },
      { name: 'sCrypt', options: ['sCrypt v1 (Legacy)', 'sCrypt v2 (scrypt-ts)'] }
    ]
  },
  {
    id: 'task',
    title: 'Coding Task',
    icon: <Cpu size={20} />,
    description: 'Objective',
    subcategories: [
      { name: 'Action', options: ['Write Code', 'Verify Signature', 'Create Transaction', 'Debug', 'Refactor', 'Optimize', 'Explain Code', 'Write Unit Tests'] },
      { name: 'Focus', options: ['Performance', 'Security', 'Scalability', 'Readability', 'Maintainability'] }
    ]
  },
  {
    id: 'testing_library',
    title: 'Testing',
    icon: <TestTube size={20} />,
    description: 'Test Frameworks',
    subcategories: [
      { name: 'JS/TS', options: ['Jest', 'Vitest', 'Cypress', 'Playwright', 'React Testing Library'] },
      { name: 'Python', options: ['PyTest', 'Unittest'] },
      { name: 'Blockchain', options: ['Foundry', 'Hardhat Test', 'sCrypt Testnet'] }
    ]
  },
  {
    id: 'principles',
    title: 'Principles',
    icon: <Settings size={20} />,
    description: 'Code Quality',
    subcategories: [
      { name: 'Paradigms', options: ['Functional Programming', 'OOP', 'Event-Driven', 'Declarative'] },
      { name: 'Best Practices', options: ['SOLID Principles', 'DRY (Don\'t Repeat Yourself)', 'Clean Code', 'TDD (Test Driven)'] }
    ]
  },
  {
    id: 'commenting_style',
    title: 'Comments',
    icon: <Quote size={20} />,
    description: 'Documentation Style',
    subcategories: [
      { name: 'Style', options: ['JSDoc', 'Docstrings (Python)', 'Minimal', 'Verbose', 'Step-by-step Explanation'] }
    ]
  }
];