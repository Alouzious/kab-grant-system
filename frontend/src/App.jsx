import DashboardLayout from './components/layout/DashboardLayout';
import PageHeader from './components/layout/PageHeader';
import Card from './components/common/Card';
import Button from './components/common/Button';
import Input from './components/common/Input';
import Badge from './components/common/Badge';
import Alert from './components/common/Alert';
import StatCard from './components/common/StatCard';
import Loader from './components/common/Loader';

export default function App() {
  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Design System Preview"
        subtitle="Explore all reusable components and layout foundations"
        action={<Button variant="primary">Create Something</Button>}
      />

      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Proposals" value="24" icon="📋" subtitle="This month" />
        <StatCard title="Under Review" value="8" icon="👁️" subtitle="Pending feedback" />
        <StatCard title="Approved" value="12" icon="✅" subtitle="All time" />
        <StatCard title="Reviewers" value="5" icon="👥" subtitle="Active" />
      </div>

      {/* Buttons and Variants */}
      <Card title="Button Variants" subtitle="All button styles and sizes" className="mb-8">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="primary">
              Small
            </Button>
            <Button size="md" variant="primary">
              Medium
            </Button>
            <Button size="lg" variant="primary">
              Large
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </div>
      </Card>

      {/* Forms and Inputs */}
      <Card title="Input Fields & Badges" subtitle="Form elements and status badges" className="mb-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="Enter your name" />
            <Input label="Email" type="email" placeholder="Enter your email" />
            <Input label="With Error" error="This field is required" />
            <Input label="Email Address" type="email" value="valid@example.com" disabled />
          </div>

          <div>
            <p className="text-sm font-medium text-textMain mb-3">Badge Variants</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Alerts */}
      <Card title="Alert Messages" subtitle="Different alert variants" className="mb-8">
        <div className="space-y-3">
          <Alert variant="success" title="Success">
            Your proposal has been submitted successfully.
          </Alert>
          <Alert variant="warning" title="Warning">
            Your submission will expire in 3 days.
          </Alert>
          <Alert variant="danger" title="Error">
            There was an error processing your request.
          </Alert>
          <Alert variant="info" title="Information">
            New grant calls are now available for review.
          </Alert>
        </div>
      </Card>

      {/* Loader */}
      <Card title="Loading State" className="mb-8">
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      </Card>
    </DashboardLayout>
  );
}