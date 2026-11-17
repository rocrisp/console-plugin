import * as cloningVmsData from './content/cloning-vms.yaml';
import * as createVmData from './content/create-vm.yaml';
import * as vmTemplatesData from './content/vm-templates.yaml';
import type { CookbookSection } from './types';

function loadSections(data: unknown, id: string): CookbookSection[] {
  const value = Array.isArray(data)
    ? data
    : typeof data === 'object' && data !== null && 'default' in data
      ? data.default
      : undefined;
  if (!Array.isArray(value)) {
    throw new Error(`Cookbook content for ${id} must contain a list of sections.`);
  }
  return value as CookbookSection[];
}

export const cookbookContent: Record<string, CookbookSection[]> = {
  'cloning-vms': loadSections(cloningVmsData, 'cloning-vms'),
  'create-vm': loadSections(createVmData, 'create-vm'),
  'vm-templates-cookbook': loadSections(vmTemplatesData, 'vm-templates-cookbook'),
};
