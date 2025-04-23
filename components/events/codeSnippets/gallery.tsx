// codeSnippets/gallery.tsx
import React from 'react';
// Import necessary components used in the GallerySection
import { Section, Row, Text, Link, Img, Column } from "@react-email/components";
// Import render to generate the preview HTML string
import { render } from '@react-email/render';

// ====================================================================
// 1. Define the Full Component Function
// ====================================================================
function GallerySection() {
  return (
    <Section style={{ marginTop: 16, marginBottom: 16 }}>
      {/* Top Text Section */}
      <Section>
        <Row>
          <Text style={styles.heading}>Drinkware</Text>
          <Text style={styles.subHeading}>Ceramic Mugs</Text>
          <Text style={styles.paragraph}>
            Picasso your pour with a sleek ceramic cup designed for beautiful
            espresso drinks. Engineered for the outdoors and designed to enhance
            the taste of your libation of choice.
          </Text>
        </Row>
      </Section>
      {/* Image Section */}
      <Section style={{ marginTop: 16 }}>
        {/* Main Image */}
        <Link href="#">
          <Img
            alt="Mugs Collection"
            height={288} // Consider using px or ensuring GrapesJS handles unitless
            src="https://react.email/static/mugs-collection.jpg"
            style={styles.mainImage}
          />
        </Link>
        {/* Two smaller images */}
        <Row style={{ marginTop: 16 }}>
          <Column style={styles.columnLeft}>
            <Link href="#">
              <Img
                alt="Monty Art Cup - 1"
                height={288}
                src="https://react.email/static/monty-art-cup-1.jpg"
                style={styles.subImage}
              />
            </Link>
          </Column>
          <Column style={styles.columnRight}>
            <Link href="#">
              <Img
                alt="Monty Art Cup - 2"
                height={288}
                src="https://react.email/static/monty-art-cup-2.jpg"
                style={styles.subImage}
              />
            </Link>
          </Column>
        </Row>
      </Section>
    </Section>
  );
}

// ====================================================================
// 2. Export the Full React Element for Rendering in GrapesJS
// ====================================================================
export const GalleryComponent: React.ReactElement = <GallerySection />;


// ====================================================================
// 3. Define and Render a Simplified Preview for the Block Manager
// ====================================================================

// A very simple representation for the small preview box
function GalleryPreviewContent() {
    return (
      <div style={previewStyles.container}>
        <img
          alt="Gallery"
          src="https://react.email/static/mugs-collection.jpg" // Use a key image
          style={previewStyles.image}
        />
        <p style={previewStyles.title}>Gallery</p>
      </div>
    );
}

// Render the preview component SYNCHRONOUSLY to an HTML string
export const galleryPreviewHtml: string = render(<GalleryPreviewContent />);

// ====================================================================
// Optional: Inline Styles (for better organization)
// ====================================================================
const styles = {
  heading: {
    margin: '0px',
    fontSize: 16,
    lineHeight: '24px',
    fontWeight: 600,
    color: 'rgb(79,70,229)', // Indigo
  },
  subHeading: {
    margin: '0px',
    marginTop: 8,
    fontSize: 24,
    lineHeight: '32px',
    fontWeight: 600,
    color: 'rgb(17,24,39)', // Dark Gray
  },
  paragraph: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: '24px',
    color: 'rgb(107,114,128)', // Medium Gray
  },
  mainImage: {
    borderRadius: 12,
    objectFit: 'cover',
    width: '100%', // Important for responsiveness
  } as React.CSSProperties, // Added type assertion for objectFit
  subImage: {
      borderRadius: 12,
      objectFit: 'cover',
      width: '100%', // Important for responsiveness
  } as React.CSSProperties, // Added type assertion for objectFit
  columnLeft: {
    width: '50%',
    paddingRight: 8,
  },
  columnRight: {
    width: '50%',
    paddingLeft: 8,
  }
};

const previewStyles = {
    container: {
        padding: '5px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        backgroundColor: '#f0f0f0', // Light background for preview box
        border: '1px solid #ccc',
        height: '100%', // Fill the preview container
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', // Center content vertically
    } as React.CSSProperties,
    image: {
        maxWidth: '85%', // Adjust size as needed
        maxHeight: '35px', // Adjust size as needed
        height: 'auto',
        borderRadius: '4px',
        display: 'block',
        objectFit: 'contain', // Use contain to avoid cropping too much
    } as React.CSSProperties,
    title: {
        fontSize: '10px',
        margin: '3px 0 0 0',
        color: '#333',
        fontWeight: '500',
        lineHeight: '1.2',
    } as React.CSSProperties,
};