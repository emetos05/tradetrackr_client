# TradeTrackr Technical Documentation

This document provides detailed technical information for developers working on the TradeTrackr frontend application.

## Table of Contents

- [Component Architecture](#component-architecture)
- [State Management Patterns](#state-management-patterns)
- [Form Handling & Validation](#form-handling--validation)
- [API Integration Patterns](#api-integration-patterns)
- [Authentication Implementation](#authentication-implementation)
- [Error Handling Strategy](#error-handling-strategy)
- [Testing Guidelines](#testing-guidelines)
- [Performance Considerations](#performance-considerations)
- [Development Workflows](#development-workflows)

## Component Architecture

### Component Hierarchy Pattern

The application follows a consistent component hierarchy for each feature:

```
Feature/
├── page.tsx                    # Server Component - Data fetching
├── error.tsx                   # Error boundary
├── components/
│   ├── [feature]-list-client.tsx    # Client Component - List management
│   ├── [feature]-form.tsx           # Form component with validation
│   ├── [feature]-actions.tsx        # Action buttons (Edit/Delete/Details)
│   ├── [feature]-details.tsx        # Detail view modal
│   └── __tests__/                   # Component tests
└── types/
    └── [feature].ts                 # TypeScript interfaces
```

### Server vs Client Components

**Server Components** (default):

- Data fetching pages (`page.tsx`)
- Static content and layouts
- Initial data loading

**Client Components** (`"use client"`):

- Interactive forms and modals
- State management and user interactions
- Dynamic content updates

### Example Component Implementation

```tsx
// jobs/page.tsx - Server Component
export default async function JobsPage() {
  const [jobs, clients] = await Promise.all([getJobs(), getClients()]);

  return (
    <main>
      <h1>Jobs</h1>
      <JobsListClient initialJobs={jobs} clients={clients} />
    </main>
  );
}

// jobs/components/jobs-list-client.tsx - Client Component
("use client");
export function JobsListClient({ initialJobs, clients }) {
  const [jobs, setJobs] = useState(initialJobs);
  // ... interactive logic
}
```

## State Management Patterns

### Local State with useState

Used for component-specific state:

```tsx
const [showForm, setShowForm] = useState(false);
const [editItem, setEditItem] = useState<Item | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Server State Management

Server actions handle data mutations and automatic revalidation:

```tsx
// Server action automatically revalidates the page
const handleCreate = async (data: Omit<Job, "id">) => {
  setLoading(true);
  try {
    await createJob(data); // Server action
    await reload(); // Refresh local state
    setShowForm(false);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Optimistic Updates Pattern

```tsx
const handleDelete = async (id: string) => {
  // Optimistically remove from UI
  const originalJobs = jobs;
  setJobs(jobs.filter((job) => job.id !== id));

  try {
    await deleteJob(id);
  } catch (err) {
    // Rollback on error
    setJobs(originalJobs);
    setError(err.message);
  }
};
```

## Form Handling & Validation

### Zod Schema Pattern

Each form uses Zod for validation:

```tsx
const jobSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.nativeEnum(JobStatus),
  hourlyRate: z.coerce.number().min(0, "Hourly rate required"),
});

type JobFormData = z.infer<typeof jobSchema>;
```

### Form State Management

```tsx
const [form, setForm] = useState<JobFormData>({
  clientId: initialJob?.clientId || "",
  title: initialJob?.title || "",
  // ... other fields
});
const [fieldErrors, setFieldErrors] = useState<
  Partial<Record<keyof JobFormData, string>>
>({});
```

### Testing Best Practices

1. Test user interactions, not implementation details
2. Use accessible queries (`getByRole`, `getByLabelText`)
3. Mock external dependencies (API calls, libraries)
4. Test error states and loading states
5. Keep tests focused on single behaviors

## Performance Considerations

### Code Splitting

```tsx
// Dynamic imports for large components
const HeavyModal = dynamic(() => import("./HeavyModal"), {
  loading: () => <LoadingSpinner />,
});
```

## Development Workflows

### Component Development Process

1. **Create TypeScript interfaces** in `types/` directory
2. **Implement Server Component** for data fetching
3. **Build Client Component** for interactivity
4. **Add form validation** with Zod schemas
5. **Implement CRUD actions** with server actions
6. **Write tests** for critical functionality
7. **Add error boundaries** and loading states

### Git Workflow

```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request
# Run tests: npm test && npm run playwright
# Review and merge
```

### Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] Zod schemas validate all form inputs
- [ ] Error states are handled gracefully
- [ ] Loading states provide user feedback
- [ ] Components are accessible (ARIA labels, keyboard nav)
- [ ] Tests cover critical user flows
- [ ] Mobile responsiveness is maintained
- [ ] Dark mode styles are applied

### Debugging Tips

1. **Use React DevTools** for component debugging
2. **Check Network tab** for API request issues
3. **Use console.log** sparingly, prefer debugger statements
4. **Test error boundaries** by throwing errors intentionally
5. **Validate form schemas** in isolation

This technical documentation should serve as a comprehensive guide for developers working on the TradeTrackr frontend application. It covers all the major patterns, best practices, and implementation details needed to maintain and extend the codebase effectively.
