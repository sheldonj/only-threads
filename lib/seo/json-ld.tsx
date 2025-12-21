import { getBaseUrl } from '@/lib/utils/metadata';

type CourseJsonLdProps = {
  readonly coverImage?: null | string;
  readonly description?: null | string;
  readonly lessonCount: number;
  readonly price: number;
  readonly slug: string;
  readonly title: string;
};

type OrganizationJsonLdProps = {
  readonly description?: string;
  readonly logo?: string;
  readonly name: string;
};

type WebsiteJsonLdProps = {
  readonly description: string;
  readonly name: string;
};

export function CourseJsonLd({
  coverImage,
  description,
  lessonCount,
  price,
  slug,
  title,
}: CourseJsonLdProps) {
  const baseUrl = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    courseMode: 'online',
    description: description || `Learn ${title} with our comprehensive course.`,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `${lessonCount} lessons`,
    },
    image: coverImage || `${baseUrl}/og.png`,
    name: title,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: price / 100,
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: 'Learn Something',
      url: baseUrl,
    },
    url: `${baseUrl}/courses/${slug}`,
  };

  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}

export function OrganizationJsonLd({
  description,
  logo,
  name,
}: OrganizationJsonLdProps) {
  const baseUrl = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    description,
    logo: logo || `${baseUrl}/logo.svg`,
    name,
    url: baseUrl,
  };

  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}

export function WebsiteJsonLd({ description, name }: WebsiteJsonLdProps) {
  const baseUrl = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    description,
    name,
    url: baseUrl,
  };

  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}
