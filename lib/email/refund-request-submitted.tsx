import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

type RefundRequestSubmittedEmailProps = {
  readonly amount: string;
  readonly courseTitle: string;
  readonly customerName: string;
  readonly isAdminCopy?: boolean;
  readonly note?: string;
  readonly reason: string;
  readonly requestDate: string;
};

export const RefundRequestSubmittedEmail = ({
  amount,
  courseTitle,
  customerName,
  isAdminCopy = false,
  note,
  reason,
  requestDate,
}: RefundRequestSubmittedEmailProps) => {
  const previewText = isAdminCopy
    ? `New refund request from ${customerName} for ${courseTitle}`
    : `Your refund request for ${courseTitle} has been submitted`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {isAdminCopy ? 'New Refund Request' : 'Refund Request Submitted'}
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              {isAdminCopy ? (
                <>A refund request has been submitted and requires your review.</>
              ) : (
                <>
                  Hi {customerName},
                  <br />
                  <br />
                  We&apos;ve received your refund request for{' '}
                  <strong>{courseTitle}</strong>. Our team will review your
                  request and get back to you soon.
                </>
              )}
            </Text>
            <Section className="bg-[#fef9e7] border border-solid border-[#f9e79f] rounded p-[16px] my-[24px]">
              <Text className="text-black text-[16px] font-semibold leading-[24px] m-0">
                Request Pending Review
              </Text>
              <Text className="text-[#666666] text-[14px] leading-[24px] m-0">
                Amount: {amount}
              </Text>
            </Section>
            <Section className="bg-[#f9f9f9] rounded p-[16px] my-[24px]">
              <Text className="text-black text-[14px] leading-[24px] m-0">
                <strong>Request Details</strong>
              </Text>
              {isAdminCopy && (
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  Customer: {customerName}
                </Text>
              )}
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Course: {courseTitle}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Amount: {amount}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Request Date: {requestDate}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Reason: {reason}
              </Text>
              {note && (
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  Customer Note: {note}
                </Text>
              )}
            </Section>
            {isAdminCopy ? (
              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                  href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/purchases`}
                >
                  Review Refund Requests
                </Button>
              </Section>
            ) : (
              <Text className="text-black text-[14px] leading-[24px]">
                You&apos;ll receive an email notification once your request has
                been reviewed. If you have any questions in the meantime, please
                contact our support team.
              </Text>
            )}
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This is an automated notification from Learn Something.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactRefundRequestSubmittedEmail(
  props: RefundRequestSubmittedEmailProps,
) {
  return <RefundRequestSubmittedEmail {...props} />;
}

