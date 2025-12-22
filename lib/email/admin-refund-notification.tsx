import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

type AdminRefundNotificationEmailProps = {
  readonly amount: string;
  readonly courseTitle: string;
  readonly customerEmail: string;
  readonly customerName: string;
  readonly reason?: string;
  readonly refundDate: string;
  readonly stripePaymentId: string;
};

export const AdminRefundNotificationEmail = ({
  amount,
  courseTitle,
  customerEmail,
  customerName,
  reason,
  refundDate,
  stripePaymentId,
}: AdminRefundNotificationEmailProps) => {
  const previewText = `Refund processed: ${courseTitle} for ${customerName}`;
  const stripePaymentUrl = `https://dashboard.stripe.com/payments/${stripePaymentId}`;

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
              A refund has been processed on your platform.
            </Text>
            <Section className="bg-[#fef2f2] border border-solid border-[#fecaca] rounded p-[16px] my-[24px]">
              <Text className="text-black text-[16px] font-semibold leading-[24px] m-0">
                -{amount}
              </Text>
              <Text className="text-[#666666] text-[14px] leading-[24px] m-0">
                {courseTitle}
              </Text>
            </Section>
            <Section className="bg-[#f9f9f9] rounded p-[16px] my-[24px]">
              <Text className="text-black text-[14px] leading-[24px] m-0">
                <strong>Customer Details</strong>
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Name: {customerName}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Email: {customerEmail}
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
                Amount: {amount}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Date: {refundDate}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Stripe ID: {stripePaymentId}
              </Text>
              {reason && (
                <Text className="text-black text-[14px] leading-[24px] m-0">
                  Reason: {reason}
                </Text>
              )}
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              View this payment in your Stripe dashboard:{' '}
              <Link
                className="text-blue-600 no-underline"
                href={stripePaymentUrl}
              >
                View in Stripe
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This is an automated notification from your Learn Something
              platform.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactAdminRefundNotificationEmail(
  props: AdminRefundNotificationEmailProps,
) {
  return <AdminRefundNotificationEmail {...props} />;
}
