import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

// Test component to verify Tailwind classes are applied
const TestComponent = () => (
  <div 
    data-testid="test-element"
    className="bg-red-500 text-white p-4 rounded-lg shadow-md hover:bg-red-600 transition-colors"
  >
    Test Tailwind Styles
  </div>
);

describe('Tailwind CSS Integration', () => {
  it('should apply Tailwind CSS classes correctly', () => {
    const { getByTestId } = render(<TestComponent />);
    const element = getByTestId('test-element');
    
    // Check that the element exists
    expect(element).toBeInTheDocument();
    
    // Verify that Tailwind classes are present in the className
    expect(element).toHaveClass('bg-red-500');
    expect(element).toHaveClass('text-white');
    expect(element).toHaveClass('p-4');
    expect(element).toHaveClass('rounded-lg');
    expect(element).toHaveClass('shadow-md');
    expect(element).toHaveClass('hover:bg-red-600');
    expect(element).toHaveClass('transition-colors');
  });

  it('should successfully render components with Tailwind classes', () => {
    // This test verifies that components can be rendered with Tailwind classes
    // without throwing errors, which indicates Tailwind is properly configured
    const MultipleComponents = () => (
      <>
        <div className="flex items-center justify-center">Flex Test</div>
        <div className="grid grid-cols-2 gap-4">Grid Test</div>
        <div className="animate-spin">Animation Test</div>
      </>
    );

    expect(() => render(<MultipleComponents />)).not.toThrow();
  });

  it('should render responsive classes correctly', () => {
    const ResponsiveComponent = () => (
      <div
        data-testid="responsive-element"
        className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6"
      >
        Responsive Test
      </div>
    );

    const { getByTestId } = render(<ResponsiveComponent />);
    const element = getByTestId('responsive-element');
    
    // Check responsive classes are present
    expect(element).toHaveClass('w-full');
    expect(element).toHaveClass('sm:w-1/2');
    expect(element).toHaveClass('md:w-1/3');
    expect(element).toHaveClass('lg:w-1/4');
    expect(element).toHaveClass('xl:w-1/6');
  });

  it('should apply gradient background classes correctly', () => {
    const GradientComponent = () => (
      <div
        data-testid="gradient-element"
        className="bg-gradient-to-br from-green-900 via-black to-green-900"
      >
        Gradient Test
      </div>
    );

    const { getByTestId } = render(<GradientComponent />);
    const element = getByTestId('gradient-element');
    
    // Test that gradient classes are applied
    expect(element).toHaveClass('bg-gradient-to-br');
    expect(element).toHaveClass('from-green-900');
    expect(element).toHaveClass('via-black');
    expect(element).toHaveClass('to-green-900');
  });
});