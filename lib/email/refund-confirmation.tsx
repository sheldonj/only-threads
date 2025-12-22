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

type RefundConfirmationEmailProps = {
  readonly amount: string;
  readonly courseTitle: string;
  readonly customerName: string;
  readonly purchaseDate: string;
  readonly refundDate: string;
};

export const RefundConfirmationEmail = ({
  amount,
  courseTitle,
  customerName,
  purchaseDate,
  refundDate,
}: RefundConfirmationEmailProps) => {
  const previewText = `Your refund for ${courseTitle} has been processed`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Refund Processed
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {customerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We&apos;ve processed a refund for your purchase of{' '}
              <strong>{courseTitle}</strong>. The refund should appear in your
              account within 5-10 business days, depending on your payment
              provider.
            </Text>
            <Section className="bg-[#fef2f2] border border-solid border-[#fecaca] rounded p-[16px] my-[24px]">
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
            <Text className="text-black text-[14px] leading-[24px]">
              Please note that you will no longer have access to this course
              content. If you have any questions about this refund, please
              contact our support team.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This is an automated notification from Learn Something. If you did
              not request this refund, please contact us immediately.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactRefundConfirmationEmail(
  props: RefundConfirmationEmailProps,
) {
  return <RefundConfirmationEmail {...props} />;
}
