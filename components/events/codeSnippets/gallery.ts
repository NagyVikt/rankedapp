// codeSnippets/gallery.ts
export const galleryCode = `
import { Section, Row, Text, Link, Img, Column } from "@react-email/components";

export default function GallerySection() {
  return (
    <Section style={{ marginTop: 16, marginBottom: 16 }}>
      <Section>
        <Row>
          <Text
            style={{
              margin: '0px',
              fontSize: 16,
              lineHeight: '24px',
              fontWeight: 600,
              color: 'rgb(79,70,229)',
            }}
          >
            Drinkware
          </Text>
          <Text
            style={{
              margin: '0px',
              marginTop: 8,
              fontSize: 24,
              lineHeight: '32px',
              fontWeight: 600,
              color: 'rgb(17,24,39)',
            }}
          >
            Ceramic Mugs
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: 16,
              lineHeight: '24px',
              color: 'rgb(107,114,128)',
            }}
          >
            Picasso your pour with a sleek ceramic cup designed for beautiful
            espresso drinks. Engineered for the outdoors and designed to enhance
            the taste of your libation of choice.
          </Text>
        </Row>
      </Section>
      <Section style={{ marginTop: 16 }}>
        <Link href="#">
          <Img
            alt="Mugs Collection"
            height={288}
            src="https://react.email/static/mugs-collection.jpg"
            style={{ borderRadius: 12, objectFit: 'cover' }}
            width="100%"
          />
        </Link>
        <Row style={{ marginTop: 16 }}>
          <Column style={{ width: '50%', paddingRight: 8 }}>
            <Link href="#">
              <Img
                alt="Monty Art Cup - 1"
                height={288}
                src="https://react.email/static/monty-art-cup-1.jpg"
                style={{ borderRadius: 12, objectFit: 'cover' }}
                width="100%"
              />
            </Link>
          </Column>
          <Column style={{ width: '50%', paddingLeft: 8 }}>
            <Link href="#">
              <Img
                alt="Monty Art Cup - 2"
                height={288}
                src="https://react.email/static/monty-art-cup-2.jpg"
                style={{
                  borderRadius: 12,
                  objectFit: 'cover',
                }}
                width="100%"
              />
            </Link>
          </Column>
        </Row>
      </Section>
    </Section>
  );
}
`;
