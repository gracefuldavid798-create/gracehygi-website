/**
 * Product Data Configuration
 * Edit this file to update product categories and items on product.html
 * The admin panel also edits this file.
 */
const PRODUCT_DATA = {
  categories: [
    {
      id: "sanitary-pads",
      name: "Sanitary Pads",
      icon: "🌸",
      color: "rose",
      products: [
        {
          id: "organic-cotton",
          name: "Organic Cotton Sanitary Pads",
          image: "product-organic-cotton",
          moq: "50,000pcs/size",
          certification: "ISO, CE",
          size: "150/190/240/285/305/350/410mm"
        },
        {
          id: "pure-cotton",
          name: "Pure Cotton Sanitary Pads",
          image: "product-pure-cotton",
          moq: "50,000pcs/size",
          certification: "ISO, CE",
          size: "150/190/240/285/305/350/410mm"
        },
        {
          id: "bamboo-fiber",
          name: "Bamboo Fiber Sanitary Pads",
          image: "product-bamboo-fiber",
          moq: "50,000pcs/size",
          certification: "ISO, CE",
          size: "150/190/240/285/305/350/410mm"
        }
      ]
    },
    {
      id: "adult-diapers",
      name: "Adult Diapers",
      icon: "💙",
      color: "blue",
      products: [
        {
          id: "super-absorbent",
          name: "Super-Absorbent Adult Diapers",
          image: "product-adult-diaper-package",
          moq: "30,000pcs/size",
          certification: "ISO, CE",
          size: "S/M/L/XL"
        }
      ]
    }
  ]
};
