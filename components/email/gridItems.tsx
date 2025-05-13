import React from 'react'
import type { ComponentItem } from './types'

// Preview HTML, icon SVG, and snippet HTML imports
import {
  galleryIconSvg,
  gallerySnippetHtml,
  galleryPreviewHtml,
} from './previews/gallery'
import {
  ecommerceIconSvg,
  ecommerceSnippetHtml,
  ecommercePreviewHtml,
} from './previews/ecommerce'
import {
  articlesIconSvg,
  articlesSnippetHtml,
  articlesPreviewHtml,
} from './previews/articles'
import {
  buttonsIconSvg,
  buttonsSnippetHtml,
  buttonsPreviewHtml,
} from './previews/buttons'
import {
  headersIconSvg,
  headersSnippetHtml,
  headersPreviewHtml,
} from './previews/headers'
import {
  footersIconSvg,
  footersSnippetHtml,
  footersPreviewHtml,
} from './previews/footers'
import {
  dividerIconSvg,
  dividerSnippetHtml,
  dividerPreviewHtml,
} from './previews/divider'
import {
  featuresIconSvg,
  featuresSnippetHtml,
  featuresPreviewHtml,
} from './previews/features'
import {
  gridIconSvg,
  gridSnippetHtml,
  gridPreviewHtml,
} from './previews/grid'
import {
  headingIconSvg,
  headingSnippetHtml,
  headingPreviewHtml,
} from './previews/heading'
import {
  linkIconSvg,
  linkSnippetHtml,
  linkPreviewHtml,
} from './previews/link'
import {
  imageIconSvg,
  imageSnippetHtml,
  imagePreviewHtml,
} from './previews/image'
import {
  marketingIconSvg,
  marketingSnippetHtml,
  marketingPreviewHtml,
} from './previews/marketing'
import {
  pricingIconSvg,
  pricingSnippetHtml,
  pricingPreviewHtml,
} from './previews/pricing'
import {
  textIconSvg,
  textSnippetHtml,
  textPreviewHtml,
} from './previews/text'

// React component wrappers
import GalleryBlock    from './components/gallery'
import EcommerceBlock  from './components/ecommerce'
import ArticlesBlock   from './components/articles'
import ButtonsBlock    from './components/buttons'
import HeadersBlock    from './components/headers'
import FootersBlock    from './components/footers'
import DividerBlock    from './components/divider'
import FeaturesBlock   from './components/features'
import GridBlock       from './components/grid'
import HeadingBlock    from './components/heading'
import LinkBlock       from './components/link'
import ImageBlock      from './components/image'
import MarketingBlock  from './components/marketing'
import PricingBlock    from './components/pricing'
import TextBlock       from './components/text'

// // The full gridItems array
export const gridItems: ComponentItem[] = [
  {
    href:        '/components/gallery',
    blockId:     'gallery',
    title:       'Christmas template',
    count:       4,
    iconSvg:     galleryIconSvg,
    snippetHtml: gallerySnippetHtml,
    previewHtml: galleryPreviewHtml,
    component:   GalleryBlock,
  },
  {
    href:        '/components/ecommerce',
    blockId:     'ecommerce',
    title:       'Thanksgiving template',
    count:       5,
    iconSvg:     ecommerceIconSvg,
    snippetHtml: ecommerceSnippetHtml,
    previewHtml: ecommercePreviewHtml,
    component:   EcommerceBlock
  },
  {
    href:        '/components/articles',
    blockId:     'articles',
    title:       'Labor Day template',
    count:       6,
    iconSvg:     articlesIconSvg,
    snippetHtml: articlesSnippetHtml,
    previewHtml: articlesPreviewHtml,
    component:   ArticlesBlock
  },
  {
    href:        '/components/buttons',
    blockId:     'buttons',
    title:       'Enviromental Impact template',
    count:       6,
    previewHtml: buttonsPreviewHtml,
    iconSvg:     buttonsIconSvg,
    snippetHtml: buttonsSnippetHtml,
    component:   ButtonsBlock
  },
  {
    href:        '/components/headers',
    blockId:     'headers',
    title:       'Thank You template',
    count:       6,
    iconSvg:     headersIconSvg,
    snippetHtml: headersSnippetHtml,
    previewHtml: headersPreviewHtml,
    component:   HeadersBlock
  },
  {
    href:        '/components/footers',
    blockId:     'footers',
    title:       'Gift template',
    count:       2,
    iconSvg:     footersIconSvg,
    snippetHtml: footersSnippetHtml,
    previewHtml: footersPreviewHtml,
    component:   FootersBlock
  },
  {
    href:        '/components/divider',
    blockId:     'divider',
    title:       'Doughnut template',
    count:       1,
    iconSvg:     dividerIconSvg,
    snippetHtml: dividerSnippetHtml,
    previewHtml: dividerPreviewHtml,
    component:   DividerBlock
  },
  {
    href:        '/components/features',
    blockId:     'features',
    title:       'Advanture template',
    count:       4,
    iconSvg:     featuresIconSvg,
    snippetHtml: featuresSnippetHtml,
    previewHtml: featuresPreviewHtml,
    component:   FeaturesBlock
  },
  {
    href:        '/components/grid',
    blockId:     'grid',
    title:       '50% OFF template',
    count:       4,
    iconSvg:     gridIconSvg,
    snippetHtml: gridSnippetHtml,
    previewHtml: gridPreviewHtml,
    component:   GridBlock
  },
  {
    href:        '/components/heading',
    blockId:     'heading',
    title:       'Lorem Ipsum template',
    count:       1,
    iconSvg:     headingIconSvg,
    snippetHtml: headingSnippetHtml,
    previewHtml: headingPreviewHtml,
    component:   HeadingBlock
  },
  {
    href:        '/components/link',
    blockId:     'link',
    title:       'Water template',
    count:       1,
    iconSvg:     linkIconSvg,
    snippetHtml: linkSnippetHtml,
    previewHtml: linkPreviewHtml,
    component:   LinkBlock
  },
  {
    href:        '/components/image',
    blockId:     'image',
    title:       'Image',
    count:       1,
    iconSvg:     imageIconSvg,
    snippetHtml: imageSnippetHtml,
    previewHtml: imagePreviewHtml,
    component:   ImageBlock
  },
  {
    href:        '/components/marketing',
    blockId:     'marketing',
    title:       'Cart template',
    count:       1,
    iconSvg:     marketingIconSvg,
    snippetHtml: marketingSnippetHtml,
    previewHtml: marketingPreviewHtml,
    component:   MarketingBlock
  },
  {
    href:        '/components/pricing',
    blockId:     'pricing',
    title:       'Pricing template',
    count:       1,
    iconSvg:     pricingIconSvg,
    snippetHtml: pricingSnippetHtml,
    previewHtml: pricingPreviewHtml,
    component:   PricingBlock
  },
  {
    href:        '/components/text',
    blockId:     'text',
    title:       'Emoji template',
    count:       1,
    iconSvg:     textIconSvg,
    snippetHtml: textSnippetHtml,
    previewHtml: textPreviewHtml,
    component:   TextBlock
  }
]
