// Print-on-Demand Detection Service
// Helps distinguish between authentic handmade and POD products

interface PODProvider {
  name: string;
  patterns: string[];
  fulfillmentIndicators: string[];
  imagePatterns: string[];
  descriptionKeywords: string[];
  shippingIndicators: string[];
}

interface PODAnalysis {
  isPOD: boolean;
  confidence: number; // 0-100
  provider?: string;
  indicators: {
    positive: string[];
    negative: string[];
  };
  recommendedAction: string;
}

class PODDetectionService {
  private podProviders: PODProvider[] = [
    {
      name: 'Printful',
      patterns: [
        'printful.com',
        'ship from our fulfillment centers',
        'printed on demand',
        'fulfillment partner'
      ],
      fulfillmentIndicators: [
        '5-7 business days processing',
        'print and ship',
        'fulfillment center',
        'production time'
      ],
      imagePatterns: [
        'mockup',
        'product visualization',
        'flat lay mockup',
        'lifestyle mockup'
      ],
      descriptionKeywords: [
        'printed when you order',
        'made to order',
        'custom printed',
        'no inventory held'
      ],
      shippingIndicators: [
        'ships from United States',
        'international shipping available',
        'tracking provided'
      ]
    },
    {
      name: 'Printify',
      patterns: [
        'printify.com',
        'print on demand service',
        'global print network'
      ],
      fulfillmentIndicators: [
        '2-5 business days production',
        'print provider',
        'fulfillment network'
      ],
      imagePatterns: [
        'design mockup',
        'product preview',
        'virtual mockup'
      ],
      descriptionKeywords: [
        'personalized',
        'custom design',
        'printed fresh'
      ],
      shippingIndicators: [
        'worldwide shipping',
        'local printing facilities'
      ]
    },
    {
      name: 'Gooten',
      patterns: [
        'gooten.com',
        'print fulfillment',
        'on-demand printing'
      ],
      fulfillmentIndicators: [
        'print and ship service',
        'fulfillment solution'
      ],
      imagePatterns: [
        'product mockup',
        'design preview'
      ],
      descriptionKeywords: [
        'made when ordered',
        'printed on demand'
      ],
      shippingIndicators: [
        'ships from multiple locations'
      ]
    },
    {
      name: 'Teespring/Spring',
      patterns: [
        'teespring.com',
        'spring.com',
        'campaign based',
        'goal-based selling'
      ],
      fulfillmentIndicators: [
        '7-14 business days',
        'campaign fulfillment'
      ],
      imagePatterns: [
        'design placement preview',
        'campaign mockup'
      ],
      descriptionKeywords: [
        'limited time',
        'campaign',
        'goal-based'
      ],
      shippingIndicators: [
        'printed and shipped when campaign ends'
      ]
    },
    {
      name: 'Redbubble',
      patterns: [
        'redbubble.com',
        'independent artists',
        'artist designed'
      ],
      fulfillmentIndicators: [
        '1-2 weeks production',
        'print-on-demand marketplace'
      ],
      imagePatterns: [
        'artist artwork',
        'design on product'
      ],
      descriptionKeywords: [
        'designed by independent artists',
        'unique designs',
        'artist marketplace'
      ],
      shippingIndicators: [
        'printed after order placed'
      ]
    },
    {
      name: 'Society6',
      patterns: [
        'society6.com',
        'artist collective',
        'curated designs'
      ],
      fulfillmentIndicators: [
        'made to order',
        'artist partnership'
      ],
      imagePatterns: [
        'artist design',
        'creative artwork'
      ],
      descriptionKeywords: [
        'artist designed',
        'creative community'
      ],
      shippingIndicators: [
        'made fresh for you'
      ]
    },
    {
      name: 'Zazzle',
      patterns: [
        'zazzle.com',
        'customize',
        'personalize'
      ],
      fulfillmentIndicators: [
        'customizable products',
        'personalization service'
      ],
      imagePatterns: [
        'customization preview',
        'personalization mockup'
      ],
      descriptionKeywords: [
        'customize your own',
        'personalize',
        'make it yours'
      ],
      shippingIndicators: [
        'made to order'
      ]
    },
    {
      name: 'CafePress',
      patterns: [
        'cafepress.com',
        'custom gifts',
        'personalized products'
      ],
      fulfillmentIndicators: [
        'custom printing service'
      ],
      imagePatterns: [
        'gift mockup',
        'custom product preview'
      ],
      descriptionKeywords: [
        'custom gifts',
        'personalized'
      ],
      shippingIndicators: [
        'custom made'
      ]
    }
  ];

  // Common POD patterns that don't belong to specific providers
  private genericPODIndicators = {
    fulfillmentPatterns: [
      'drop shipped',
      'dropshipped',
      'third party fulfillment',
      'white label',
      'private label',
      'bulk ordered',
      'wholesale purchased'
    ],
    processingTimePatterns: [
      '3-5 business days processing',
      '5-7 business days to print',
      '1-2 weeks production time',
      'allow extra time for printing',
      'custom printing takes',
      'processing before shipping'
    ],
    qualityIndicators: [
      'print quality may vary',
      'color variations possible',
      'printed on standard',
      'basic quality',
      'mass produced'
    ],
    imageQualityFlags: [
      'stock photo',
      'generic mockup',
      'template design',
      'mass market design',
      'low resolution'
    ]
  };

  async analyzePODLikelihood(
    productData: any,
    storeUrl: string,
    productDescription: string,
    imageAnalysis?: any
  ): Promise<PODAnalysis> {
    let podScore = 0;
    const positiveIndicators: string[] = [];
    const negativeIndicators: string[] = [];
    let detectedProvider: string | undefined;

    const fullText = `${productDescription} ${storeUrl} ${JSON.stringify(productData)}`.toLowerCase();

    // Check for specific POD provider patterns
    for (const provider of this.podProviders) {
      let providerScore = 0;
      
      // Check URL and description patterns
      for (const pattern of provider.patterns) {
        if (fullText.includes(pattern.toLowerCase())) {
          providerScore += 30;
          positiveIndicators.push(`Detected ${provider.name} pattern: ${pattern}`);
        }
      }

      // Check fulfillment indicators
      for (const indicator of provider.fulfillmentIndicators) {
        if (fullText.includes(indicator.toLowerCase())) {
          providerScore += 20;
          positiveIndicators.push(`POD fulfillment indicator: ${indicator}`);
        }
      }

      // Check description keywords
      for (const keyword of provider.descriptionKeywords) {
        if (fullText.includes(keyword.toLowerCase())) {
          providerScore += 15;
          positiveIndicators.push(`POD keyword found: ${keyword}`);
        }
      }

      // Check shipping indicators
      for (const shipping of provider.shippingIndicators) {
        if (fullText.includes(shipping.toLowerCase())) {
          providerScore += 10;
          positiveIndicators.push(`POD shipping indicator: ${shipping}`);
        }
      }

      if (providerScore > podScore) {
        podScore = providerScore;
        detectedProvider = provider.name;
      }
    }

    // Check generic POD patterns
    for (const pattern of this.genericPODIndicators.fulfillmentPatterns) {
      if (fullText.includes(pattern.toLowerCase())) {
        podScore += 25;
        positiveIndicators.push(`Generic POD pattern: ${pattern}`);
      }
    }

    for (const pattern of this.genericPODIndicators.processingTimePatterns) {
      if (fullText.includes(pattern.toLowerCase())) {
        podScore += 20;
        positiveIndicators.push(`POD processing time indicator: ${pattern}`);
      }
    }

    for (const pattern of this.genericPODIndicators.qualityIndicators) {
      if (fullText.includes(pattern.toLowerCase())) {
        podScore += 15;
        positiveIndicators.push(`POD quality indicator: ${pattern}`);
      }
    }

    // Check for handmade contradictory indicators
    const handmadeIndicators = [
      'handmade',
      'hand crafted',
      'artisan made',
      'one of a kind',
      'unique piece',
      'made by me',
      'crafted in my studio',
      'personally made',
      'hand painted',
      'hand sewn'
    ];

    let handmadeScore = 0;
    for (const indicator of handmadeIndicators) {
      if (fullText.includes(indicator.toLowerCase())) {
        handmadeScore += 20;
        negativeIndicators.push(`Handmade indicator found: ${indicator}`);
      }
    }

    // Adjust final score based on handmade indicators
    const finalScore = Math.max(0, Math.min(100, podScore - handmadeScore));

    // Determine if it's POD and recommendation
    const isPOD = finalScore > 40;
    let recommendedAction: string;

    if (finalScore > 70) {
      recommendedAction = 'Very likely POD - expect standard quality and longer processing times';
    } else if (finalScore > 40) {
      recommendedAction = 'Possibly POD - verify authenticity and check reviews for quality consistency';
    } else if (handmadeScore > 30) {
      recommendedAction = 'Likely authentic handmade - verify seller credibility and craftsmanship';
    } else {
      recommendedAction = 'Unable to determine - research seller background and product reviews';
    }

    return {
      isPOD,
      confidence: finalScore,
      provider: detectedProvider,
      indicators: {
        positive: positiveIndicators,
        negative: negativeIndicators
      },
      recommendedAction
    };
  }

  // Enhanced method to check store-wide POD patterns
  async analyzeStorePODPatterns(storeUrl: string, productCatalog: any[]): Promise<{
    storePODLikelihood: number;
    patterns: string[];
    recommendations: string[];
  }> {
    let storePODScore = 0;
    const detectedPatterns: string[] = [];
    const recommendations: string[] = [];

    // Analyze product diversity and patterns
    const productTitles = productCatalog.map(p => p.title || '').join(' ').toLowerCase();
    const productDescriptions = productCatalog.map(p => p.description || '').join(' ').toLowerCase();
    const storeText = `${storeUrl} ${productTitles} ${productDescriptions}`.toLowerCase();

    // Check for POD store patterns
    const podStoreIndicators = [
      'custom printing',
      'personalized gifts',
      'design your own',
      'made to order',
      'print on demand',
      'no minimum order',
      'unlimited designs'
    ];

    for (const indicator of podStoreIndicators) {
      if (storeText.includes(indicator)) {
        storePODScore += 15;
        detectedPatterns.push(`Store POD indicator: ${indicator}`);
      }
    }

    // Analyze product catalog diversity (POD stores often have many similar products)
    if (productCatalog.length > 50) {
      storePODScore += 10;
      detectedPatterns.push('Large product catalog suggests POD operation');
    }

    // Check for consistent product types (POD stores often focus on specific categories)
    const productTypes = productCatalog.map(p => p.product_type || '').filter(t => t);
    const uniqueTypes = new Set(productTypes);
    
    if (productTypes.length > 20 && uniqueTypes.size < 5) {
      storePODScore += 20;
      detectedPatterns.push('Product catalog shows POD specialization patterns');
    }

    // Generate recommendations based on analysis
    if (storePODScore > 50) {
      recommendations.push('This appears to be a POD store - expect consistent quality but longer processing');
      recommendations.push('Verify design originality if uniqueness is important');
      recommendations.push('Check processing times before ordering time-sensitive items');
    } else if (storePODScore > 25) {
      recommendations.push('Mixed indicators - some products may be POD while others are handmade');
      recommendations.push('Check individual product descriptions for production methods');
    } else {
      recommendations.push('No clear POD patterns detected - likely authentic handmade or retail');
    }

    return {
      storePODLikelihood: Math.min(100, storePODScore),
      patterns: detectedPatterns,
      recommendations
    };
  }

  // Method to get POD provider information for educational purposes
  getPODProviderInfo(providerName: string): PODProvider | null {
    return this.podProviders.find(p => p.name.toLowerCase() === providerName.toLowerCase()) || null;
  }

  // Method to get all known POD providers for educational reference
  getAllPODProviders(): { name: string; description: string }[] {
    return [
      { name: 'Printful', description: 'Professional POD service with global fulfillment centers' },
      { name: 'Printify', description: 'POD platform with network of print providers worldwide' },
      { name: 'Gooten', description: 'On-demand printing and fulfillment service' },
      { name: 'Teespring/Spring', description: 'Campaign-based POD platform for creators' },
      { name: 'Redbubble', description: 'Artist marketplace with POD fulfillment' },
      { name: 'Society6', description: 'Curated artist community with POD products' },
      { name: 'Zazzle', description: 'Customizable POD products and gifts' },
      { name: 'CafePress', description: 'Custom POD gifts and personalized products' }
    ];
  }
}

export const podDetectionService = new PODDetectionService();
export type { PODAnalysis, PODProvider };