import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Img,
} from '@react-email/components';

export function PromoEmail() {
  return (
    <Html>
      <Head />
      <Preview>Special Offer!</Preview>
      <Body>
        <Container>
          <Section>
            <Img
              src="https://placekitten.com/600/200"
              alt="Promo"
              width="100%"
            />
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              50% off all items!
            </Text>
            <Button href="https://shop.example.com">Shop Now</Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
