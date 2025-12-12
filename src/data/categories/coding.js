import React from 'react';
import { 
  Terminal, 
  Cpu, 
  Settings, 
  Code2, 
  TestTube, 
  Quote 
} from 'lucide-react';

export const CODING_DATA = [
  {
    id: 'language',
    title: 'Language & Stack',
    icon: <Terminal size={20} />,
    description: 'Tech Stack',
    subcategories: [
      { name: 'Languages', options: ['sCrypt', 'Bitcoin Script', 'Python', 'TypeScript', 'JavaScript', 'Rust', 'Go', 'C++', 'Swift', 'SQL', 'Solidity'] },
      { name: 'Web Frameworks', options: ['React', 'Next.js', 'Vue', 'Svelte', 'Tailwind CSS', 'Node.js', 'Django'] },
      { name: 'Blockchain/BSV', options: ['scrypt-ts', 'BSV SDK', 'Whatsonchain API', 'Gorilla Pool', 'JungleBus'] },
      { name: 'Data/ML', options: ['Pandas', 'PyTorch', 'TensorFlow', 'NumPy', 'Scikit-learn'] }
    ]
  },
  {
    id: 'framework_version',
    title: 'Version',
    icon: <Code2 size={20} />,
    description: 'Specific Versions',
    subcategories: [
      { name: 'Web', options: ['React 18', 'React 19', 'Next.js 13', 'Next.js 14', 'Vue 3'] },
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
      { name: 'Action', options: ['Write Smart Contract', 'Verify Signature', 'Create Transaction', 'Debug', 'Refactor', 'Optimize', 'Explain Code', 'Write Unit Tests'] },
      { name: 'Focus', options: ['UTXO Management', 'Stateful Contracts', 'Push Data', 'OP_RETURN', 'Performance', 'Security', 'Scalability'] }
    ]
  },
  {
    id: 'testing_library',
    title: 'Testing',
    icon: <TestTube size={20} />,
    description: 'Test Frameworks',
    subcategories: [
      { name: 'JS/TS', options: ['Mocha', 'Chai', 'Jest', 'Vitest', 'Cypress', 'Playwright'] },
      { name: 'Python', options: ['PyTest', 'Unittest'] },
      { name: 'Smart Contracts', options: ['sCrypt Testnet', 'Local Mock'] }
    ]
  },
  {
    id: 'principles',
    title: 'Principles',
    icon: <Settings size={20} />,
    description: 'Code Quality',
    subcategories: [
      { name: 'Paradigms', options: ['Functional Programming', 'OOP', 'Event-Driven', 'UTXO Model'] },
      { name: 'Best Practices', options: ['SOLID Principles', 'DRY', 'Clean Code', 'TDD'] }
    ]
  },
  {
    id: 'commenting_style',
    title: 'Comments',
    icon: <Quote size={20} />,
    description: 'Documentation Style',
    subcategories: [
      { name: 'Style', options: ['JSDoc', 'Docstrings', 'Minimal', 'Verbose', 'Step-by-step Explanation'] }
    ]
  }
];