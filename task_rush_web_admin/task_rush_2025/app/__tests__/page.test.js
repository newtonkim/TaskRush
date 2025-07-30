import { render, screen, waitFor } from '@testing-library/react';
import AdminPanel from '../page';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore');
  return {
    ...originalModule,
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    getDocs: jest.fn(),
  };
});

describe('AdminPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<AdminPanel />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

    it('renders users and tasks after data fetch', async () => {
      const mockUsers = [
        {
          id: 'user1',
          email: 'user1@example.com',
          photoURL: '',
          taskCount: 2,
          tasks: [
            { id: 'task1', title: 'Task 1', completed: false, createdAt: { seconds: 1620000000 } },
            { id: 'task2', title: 'Task 2', completed: true, createdAt: { seconds: 1620003600 } },
          ],
        },
      ];

      const { getDocs, collection, query } = require('firebase/firestore');

      // Mock Firestore getDocs to return mock data
      getDocs.mockImplementation(async (q) => {
        if (q._queryOptions?.collectionId === 'users') {
          return {
            docs: mockUsers.map(user => ({
              id: user.id,
              data: () => ({ email: user.email, photoURL: user.photoURL }),
            })),
          };
        } else if (q._queryOptions?.collectionId === 'tasks') {
          const userId = q._queryOptions.parentPath.segments[1];
          const user = mockUsers.find(u => u.id === userId);
          return {
            size: user ? user.tasks.length : 0,
            docs: user ? user.tasks.map(task => ({
              id: task.id,
              data: () => task,
            })) : [],
          };
        }
        return { docs: [] };
      });

      await act(async () => {
        render(<AdminPanel />);
      });

      await waitFor(() => {
        expect(screen.getByText((content, element) => content.startsWith('Users ('))).toBeInTheDocument();
        expect(screen.getByText((content, element) => content.includes('user1'))).toBeInTheDocument();
        expect(screen.getByText((content, element) => content.includes('user1@example.com'))).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText((content, element) => content.includes('Tasks for user1@example.com'))).toBeInTheDocument();
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getAllByText('Pending').length).toBe(1);
        expect(screen.getAllByText('Completed').length).toBe(1);
      });
    });
});
