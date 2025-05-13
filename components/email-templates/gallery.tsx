import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Link,
  Img,
} from '@react-email/components';
export function GalleryComponent() {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        {/* Preload product images for faster render on supported clients */}
        <link
          rel="preload"
          as="image"
          href="/static/stagg-electric-kettle.jpg"
        />
        <link rel="preload" as="image" href="/static/ode-grinder.jpg" />
        <link
          rel="preload"
          as="image"
          href="/static/atmos-vacuum-canister.jpg"
        />
        <link
          rel="preload"
          as="image"
          href="/static/clyde-electric-kettle.jpg"
        />

        {/* Inter font (400/600/700) – self-hosted for maximum compatibility */}
        <style>
          {`
              @font-face {
                font-family: 'Inter';
                font-style: normal;
                font-weight: 400;
                mso-font-alt: 'Helvetica';
                src: url(https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2) format('woff2');
              }
              @font-face {
                font-family: 'Inter';
                font-style: normal;
                font-weight: 600;
                mso-font-alt: 'Helvetica';
                src: url(https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_fjbvMwCp50PDca1ZL7.woff2) format('woff2');
              }
              @font-face {
                font-family: 'Inter';
                font-style: normal;
                font-weight: 700;
                mso-font-alt: 'Helvetica';
                src: url(https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_fjbvMwCp50BTca1ZL7.woff2) format('woff2');
              }
              * {
                font-family: 'Inter', Helvetica, Arial, sans-serif;
              }
            `}
        </style>
      </Head>

      {/* This line shows up as the inbox preview text */}
      <Preview>Elegant Style – discover our award-winning coffee gear</Preview>

      <Body style={{ margin: 0, padding: '1rem' }}>
        <Container style={{ maxWidth: '600px', width: '100%' }}>
          {/* Header copy */}
          <Section>
            <Heading
              as="h6"
              style={{
                fontSize: '16px',
                lineHeight: '24px',
                fontWeight: 600,
                color: '#4f46e5',
                margin: 0,
              }}
            >
              Our products
            </Heading>
            <Heading
              as="h2"
              style={{
                fontSize: '24px',
                lineHeight: '32px',
                fontWeight: 600,
                color: '#111827',
                margin: 0,
              }}
            >
              Elegant Style
            </Heading>
            <Text
              style={{
                fontSize: '16px',
                lineHeight: '24px',
                color: '#6b7280',
                marginTop: '8px',
                marginBottom: '16px',
              }}
            >
              We spent two years in development to bring you the next generation
              of our award-winning home brew grinder. From the finest pour-overs
              to the coarsest cold brews, your coffee will never be the same
              again.
            </Text>
          </Section>

          {/* 2 × 2 product gallery */}
          <Section>
            <Row>
              <Column>
                <Link href="#" target="_blank">
                  <Img
                    src="https://react.email/static/stagg-electric-kettle.jpg"
                    alt="Stagg Electric Kettle"
                    width="100%"
                    height="288"
                    style={{ borderRadius: '12px', objectFit: 'cover' }}
                  />
                </Link>
              </Column>
              <Column>
                <Link href="#" target="_blank">
                  <Img
                    src="https://react.email/static/ode-grinder.jpg"
                    alt="Ode Grinder"
                    width="100%"
                    height="288"
                    style={{ borderRadius: '12px', objectFit: 'cover' }}
                  />
                </Link>
              </Column>
            </Row>

            <Row style={{ marginTop: '16px' }}>
              <Column>
                <Link href="#" target="_blank">
                  <Img
                    src="https://react.email/static/atmos-vacuum-canister.jpg"
                    alt="Atmos Vacuum Canister"
                    width="100%"
                    height="288"
                    style={{ borderRadius: '12px', objectFit: 'cover' }}
                  />
                </Link>
              </Column>
              <Column>
                <Link href="#" target="_blank">
                  <Img
                    src="https://react.email/static/clyde-electric-kettle.jpg"
                    alt="Clyde Electric Kettle"
                    width="100%"
                    height="288"
                    style={{ borderRadius: '12px', objectFit: 'cover' }}
                  />
                </Link>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default GalleryComponent;
