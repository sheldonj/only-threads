import {
  Body,
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

type RefundRequestApprovedEmailProps = {
  readonly adminNote?: string;
  readonly amount: string;
  readonly courseTitle: string;
  readonly customerName: string;
  readonly purchaseDate: string;
  readonly refundDate: string;
};

export const RefundRequestApprovedEmail = ({
  adminNote,
  amount,
  courseTitle,
  customerName,
  purchaseDate,
  refundDate,
}: RefundRequestApprovedEmailProps) => {
  const previewText = `Your refund for ${courseTitle} has been approved`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Refund Approved
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {customerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Great news! Your refund request for <strong>{courseTitle}</strong>{' '}
              has been approved. The refund should appear in your account within
              5-10 business days, depending on your payment provider.
            </Text>
            <Section className="bg-[#ecfdf5] border border-solid border-[#6ee7b7] rounded p-[16px] my-[24px]">
              <Text className="text-black text-[16px] font-semibold leading-[24px] m-0">
                Refund Amount: {amount}
              </Text>
              <Text className="text-[#666666] text-[14px] leading-[24px] m-0">
                {courseTitle}
              </Text>
            </Section>
            <Section className="bg-[#f9f9f9] rounded p-[16px] my-[24px]">
              <Text className="text-black text-[14px] leading-[24px] m-0">
                <strong>Refund Details</strong>
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Course: {courseTitle}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Original Purchase Date: {purchaseDate}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Refund Date: {refundDate}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Amount Refunded: {amount}
              </Text>
            </Section>
            {adminNote && (
              <Section className="bg-[#f0f9ff] border border-solid border-[#bae6fd] rounded p-[16px] my-[24px]">
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  <strong>Note from our team:</strong>
                </Text>
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  {adminNote}
                </Text>
              </Section>
            )}
            <Text className="text-black text-[14px] leading-[24px]">
              Please note that you will no longer have access to this course
              content. We hope to see you again in the future!
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This is an automated notification from Learn Something. If you have
              any questions, please contact our support team.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactRefundRequestApprovedEmail(
  props: RefundRequestApprovedEmailProps,
) {
  return <RefundRequestApprovedEmail {...props} />;
}

