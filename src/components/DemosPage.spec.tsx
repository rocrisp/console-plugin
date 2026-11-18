import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { cards } from '../data/cards';

let mockNamespace = 'demo';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  const setActiveQuickStart = jest.fn();
  return {
    DocumentTitle: ({ children }: { children: React.ReactNode }) => <title>{children}</title>,
    ListPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
    NamespaceBar: ({ isDisabled }: { isDisabled?: boolean }) => (
      <select
        aria-label="Project"
        value={mockNamespace}
        disabled={isDisabled}
        onChange={(event) => {
          mockNamespace = event.target.value;
        }}
      >
        {['#ALL_NS#', 'demo', 'other'].map((project) => (
          <option key={project} value={project}>
            {project}
          </option>
        ))}
      </select>
    ),
    useActiveNamespace: () => [mockNamespace],
    useK8sWatchResources: jest.fn(() => ({})),
    useK8sModel: () => [undefined, false],
    useListPageFilter: (data: unknown[]) => [data, data, jest.fn()],
    ListPageFilter: () => null,
    VirtualizedTable: () => null,
    useQuickStartContext: () => ({ setActiveQuickStart }),
    k8sCreate: jest.fn().mockResolvedValue({}),
    k8sGet: jest.fn().mockRejectedValue({ code: 404 }),
    setActiveQuickStart,
  };
});

import DemosPage from './DemosPage';

const sdk = jest.requireMock<{
  k8sCreate: jest.Mock<
    Promise<unknown>,
    [
      {
        ns: string;
        data: {
          kind: string;
          metadata: { name: string; namespace: string; labels: Record<string, string> };
          spec: { pipelineSpec: unknown; taskRunTemplate: { serviceAccountName: string } };
        };
      },
    ]
  >;
  setActiveQuickStart: jest.Mock;
  k8sGet: jest.Mock;
  useK8sWatchResources: jest.Mock;
}>('@openshift-console/dynamic-plugin-sdk');

beforeEach(() => {
  jest.clearAllMocks();
  mockNamespace = 'demo';
  sdk.k8sCreate.mockResolvedValue({});
  sdk.k8sGet.mockRejectedValue({ code: 404 });
});

describe('DemosPage', () => {
  it('shows all demo cards', () => {
    render(
      <MemoryRouter>
        <DemosPage />
      </MemoryRouter>,
    );
    expect(screen.getAllByTestId(/^card-(?!action)/)).toHaveLength(cards.length);
    expect(screen.getByText('Creating Virtual Machines')).toBeInTheDocument();
    expect(screen.getByText('Custom VM Templates')).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: Cloning Virtual Machines')).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: Cloud-init Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: VM Instancetypes & Preferences')).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: Using virtctl for VM management')).toBeInTheDocument();
    expect(
      screen.getByText('VM Cookbook: Install and configure OpenShift Virtualization'),
    ).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: Install the LVM Storage Operator')).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: Create a VM from the web console')).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: Create custom VM templates')).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: Understanding VM lifecycle states')).toBeInTheDocument();
  });

  it.each(cards.filter((card) => card.kind === 'quickstart'))(
    'starts the ConsoleQuickStart from the $id card',
    ({ id, quickStartId }) => {
      render(
        <MemoryRouter>
          <DemosPage />
        </MemoryRouter>,
      );
      fireEvent.click(screen.getByTestId(`card-action-${id}`));
      expect(sdk.setActiveQuickStart).toHaveBeenCalledWith(quickStartId);
    },
  );

  it('filters by title and body, then clears the empty result', () => {
    render(
      <MemoryRouter>
        <DemosPage />
      </MemoryRouter>,
    );
    const search = screen.getByRole('textbox', { name: 'Search demos' });
    fireEvent.change(search, { target: { value: 'guided walkthrough' } });
    expect(screen.getAllByTestId(/^card-(?!action)/)).toHaveLength(5);
    expect(screen.getByText('VM Cookbook: VM Instancetypes & Preferences')).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: Create a VM from the web console')).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: Create custom VM templates')).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: Cloning Virtual Machines')).toBeInTheDocument();
    expect(screen.getByText('VM Cookbook: Cloud-init Fundamentals')).toBeInTheDocument();
    fireEvent.change(search, { target: { value: 'no matching demo' } });
    expect(screen.getByText('No demos match your filters')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('clear-filters'));
    expect(screen.getAllByTestId(/^card-(?!action)/)).toHaveLength(cards.length);
  });

  it('filters by kind and displays each action in the footer', () => {
    render(
      <MemoryRouter>
        <DemosPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cookbook' }));
    expect(screen.getAllByTestId(/^card-(?!action)/)).toHaveLength(2);
    expect(screen.getAllByText('Open cookbook')).toHaveLength(2);
  });
});
