/**
 * Integration & Component Tests with Testing Library (components.test.tsx)
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ChatPanel } from '../components/ChatPanel';
import { GateRejectCard } from '../components/GateRejectCard';
import { ResultCard } from '../components/ResultCard';
import { VerdictBadge } from '../components/VerdictBadge';
import { LoginPage } from '../pages/LoginPage';

describe('React Component & Accessibility Integration', () => {
  it('renders VerdictBadge with explicit text label and accessible role', () => {
    render(<VerdictBadge label="Review" borderline={true} />);
    const badge = screen.getByRole('status', { name: /Screening Verdict: Review/i });
    expect(badge).toBeDefined();
    expect(screen.getByText('Review')).toBeDefined();
    expect(screen.getByText('Borderline')).toBeDefined();
  });

  it('renders GateRejectCard with reasons and upload guidance without rendering a verdict', () => {
    const gateResult = {
      passed: false,
      reasons: ['This is a colour photo. Expected a grayscale medical scan.'],
      metrics: { colorDiff: 35.0, contrastStd: 0.2, laplacianVariance: 25.0 },
    };

    render(<GateRejectCard gateResult={gateResult} />);
    expect(screen.getByText(/Input Safety Gate: Image Rejected/i)).toBeDefined();
    expect(screen.getByText(/This is a colour photo/i)).toBeDefined();
    expect(screen.queryByText(/Normal/i)).toBeNull();
    expect(screen.queryByText(/Review/i)).toBeNull();
  });

  it('renders ResultCard with mandatory regulatory disclaimer and scores', () => {
    const result: any = {
      fileName: 'test.png',
      timestamp: new Date().toISOString(),
      gateResult: { passed: true, reasons: [], metrics: {} },
      score: 1.25,
      verdict: {
        label: 'Review',
        borderline: false,
        percentile: 96.5,
        percentileText: 'More unusual than 96.5% of healthy validation scans',
        explanation: 'Moderate deviation.',
      },
      areaPercent: 12.0,
      region: 'lower right',
      explanationSentence: 'Unusual pattern in the lower right of the image, about 12% of the area. Not a diagnosis.',
      reliabilityResult: { level: 'High', shouldAbstain: false, factors: [] },
      timings: { total: 400 },
    };

    render(<ResultCard result={result} inputImageSource="data:image/png;base64,fake" />);
    expect(screen.getByText(/This flags an unusual pattern for clinician review. It is not a diagnosis./i)).toBeDefined();
    expect(screen.getByText(/More unusual than 96.5% of healthy validation scans/i)).toBeDefined();
    expect(screen.getByText('Review')).toBeDefined();
  });

  it('renders LoginPage with demo button and accessible inputs', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /Continue as demo user/i })).toBeDefined();
    expect(screen.getByLabelText(/Work Email/i)).toBeDefined();
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
  });

  it('ChatPanel safely refuses diagnostic questions', async () => {
    render(<ChatPanel />);
    const input = screen.getByPlaceholderText(/Ask about screening/i);
    const sendBtn = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'Do I have pneumonia?' } });
    fireEvent.click(sendBtn);

    // Should render safe refusal
    const refusal = await screen.findByText(/cannot provide a personal diagnosis/i);
    expect(refusal).toBeDefined();
  });
});
