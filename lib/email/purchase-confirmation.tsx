import {
  Body,
  Button,
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

type PurchaseConfirmationEmailProps = {
  readonly amount: string;
  readonly courseTitle: string;
  readonly courseUrl: string;
  readonly customerName: string;
  readonly purchaseDate: string;
};

export const PurchaseConfirmationEmail = ({
  amount,
  courseTitle,
  courseUrl,
  customerName,
  purchaseDate,
}: PurchaseConfirmationEmailProps) => {
  const previewText = `Thank you for purchasing ${courseTitle}!`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Thank You for Your Purchase!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {customerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for purchasing <strong>{courseTitle}</strong>. Your
              order has been confirmed and you now have full access to the
              course.
            </Text>
            <Section className="bg-[#f9f9f9] rounded p-[16px] my-[24px]">
              <Text className="text-black text-[14px] leading-[24px] m-0">
                <strong>Order Summary</strong>
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Course: {courseTitle}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Amount: {amount}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0">
                Date: {purchaseDate}
              </Text>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>How to access your course:</strong>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              1. Click the button below to go directly to your course
              <br />
              2. You can also find all your courses in your Library
              <br />
              3. Start learning at your own pace!
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={courseUrl}
              >
                Start Learning Now
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Or copy and paste this URL into your browser:{' '}
              <Link
                className="text-blue-600 no-underline"
                href={courseUrl}
              >
                {courseUrl}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you have any questions about your purchase or need assistance,
              please don&apos;t hesitate to reach out to our support team.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export function reactPurchaseConfirmationEmail(
  props: PurchaseConfirmationEmailProps,
) {
  return <PurchaseConfirmationEmail {...props} />;
}
