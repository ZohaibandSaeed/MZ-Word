import { BlankDOCX } from 'superdoc';

export const STARTER_TEMPLATES = [
  {
    id: 'blank',
    title: 'Blank Document',
    fileName: 'Untitled Document.docx',
    description: 'Start with a clean page and default formatting',
    source: BlankDOCX,
  },
  {
    id: 'proposal',
    title: 'Business Proposal',
    fileName: 'Business Proposal.docx',
    description: 'Structure for project bids, scopes of work, and executive summaries',
    source: BlankDOCX,
  },
  {
    id: 'meeting',
    title: 'Meeting Notes',
    fileName: 'Meeting Notes.docx',
    description: 'Record agendas, discussion points, decisions, and action items',
    source: BlankDOCX,
  }
];

export function getTemplateById(templateId) {
  return STARTER_TEMPLATES.find((t) => t.id === templateId) || STARTER_TEMPLATES[0];
}
