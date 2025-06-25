import React, { useState, useEffect } from "react";
import { ShoppingCart, User, Menu, Search, Plus, Minus, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
// import ProductCard from "./ProductCard"; // Import the separated component

const EcommerceHomepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [cartNotification, setCartNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const PRODUCTS_PER_PAGE = 8;
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(
    "AIzaSyAlSSrV234_1KanTo0-96ArE_lPilxVu0A"
  );
  const [sheetId, setSheetId] = useState("");
  const [range, setRange] = useState("Sheet1!A:H");
  const [rangeUI, setRangeUI] = useState("Sheet2!A:J");
  const [UI, setUI] = useState(null);
  // const categories = new Set();
  // Function to parse variants string into proper object format

  const [categories, setCategories] = useState(new Set());
  const parseVariants = (variantsString) => {
    if (
      !variantsString ||
      variantsString.trim() === "" ||
      variantsString === "undefined"
    ) {
      return {};
    }

    try {
      // If it's already JSON, parse it
      if (variantsString.startsWith("{")) {
        return JSON.parse(variantsString);
      }

      // Handle custom format like: "color:Black,White,Blue|type:Standard,Pro"
      const variants = {};
      const groups = variantsString.split("|");

      groups.forEach((group) => {
        if (group.includes(":")) {
          const [key, values] = group.split(":");
          if (key && values) {
            variants[key.trim()] = values.split(",").map((value, index) => ({
              name: value.trim(),
              value: value.trim().toLowerCase().replace(/\s+/g, ""),
              priceModifier: 0, // Default price modifier
            }));
          }
        }
      });

      return variants;
    } catch (error) {
      console.warn("Failed to parse variants:", variantsString, error);
      return {};
    }
  };

  // Main function to convert Google Sheets data to products array
  const fetchAndConvertToProducts = async (id) => {
    if (!apiKey.trim()) {
      setError("API key is required");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${range}?key=${apiKey}`;
      console.log("Fetching from URL:", url);

      const response = await fetch(url);
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          // If can't parse error response, use status
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      if (!data.values || data.values.length === 0) {
        throw new Error(
          "No data found in the sheet. Check if the sheet has data and the range is correct."
        );
      }

      // Skip header row
      const rows = data.values.slice(1);

      // ✅ Collect categories while processing rows
      const newCategories = new Set();
      newCategories.add("All");
      const productsArray = rows
        .filter((row) => row && row.length > 0 && row[1])
        .map((row) => {
          const safeRow = [...row];
          while (safeRow.length < 8) {
            safeRow.push("");
          }

          const category = safeRow[3] || "";

          // ✅ Add category to Set (duplicates automatically ignored)
          if (category.trim()) {
            newCategories.add(category.trim());
          }

          const product = {
            id: parseInt(safeRow[0]) || Math.floor(Math.random() * 1000),
            name: safeRow[1] || "",
            price: parseFloat(safeRow[2]) || 0,
            category: category,
            rating: parseFloat(safeRow[4]) || 0,
            image: safeRow[5] || "",
            originalPrice: parseFloat(safeRow[6]) || 0,
            variants: parseVariants(safeRow[7]),
          };

          return product;
        });

      // ✅ Update categories state ONCE after processing all data
      setCategories(newCategories);

      console.log("Converted products array:", productsArray);
      console.log("Extracted categories:", Array.from(newCategories));

      setProducts(productsArray);
      return productsArray;
    } catch (err) {
      console.error("Detailed error:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAndConvertToUI = async (id) => {
    if (!apiKey.trim()) {
      setError("API key is required");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${rangeUI}?key=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          // Error parsing error response
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("UI Raw API response >>", data);

      if (!data.values || data.values.length === 0) {
        throw new Error(
          "No data found in the sheet. Check if the sheet has data and the range is correct."
        );
      }

      // Get headers from first row
      const headers = data.values[0];

      // Get data rows (skip header)
      const rows = data.values.slice(1);

      // Filter out empty rows
      const validRows = rows.filter((row) => row && row.length > 0 && row[1]);

      // Transform data into UI object
      const UI = {
        logo: "",
        banner: [],
        navbar: {
          bgColor: "",
          iconColor: "",
        },
        product: {
          nameColor: "",
        },
        button: {
          bgColor: "",
          textColor: "",
        },
      };

      // Process each valid row
      validRows.forEach((row, index) => {
        // Ensure row has enough columns, pad with empty strings if needed
        const safeRow = [...row];
        while (safeRow.length < headers.length) {
          safeRow.push("");
        }

        // Map data based on header positions
        const rowData = {};
        headers.forEach((header, headerIndex) => {
          rowData[header] = safeRow[headerIndex] || "";
        });

        // Set logo (only from first row)
        if (index === 0) {
          UI.logo = rowData["Logo"] || "";
          UI.navbar.bgColor = rowData["Navbar BgColor"] || "";
          UI.navbar.iconColor = rowData["Navbar IconColor"] || "";
          UI.product.nameColor = rowData["Product NameColor"] || "";
          UI.button.bgColor = rowData["Button BgColor"] || "";
          UI.button.textColor = rowData["Button TextColor"] || "";
        }

        // Create banner object for each row
        if (rowData["Banner Title"]) {
          const banner = {
            id: index + 1,
            title: rowData["Banner Title"] || "",
            subtitle: rowData["Banner Subtitle"] || "",
            bg:
              rowData["Banner Background"] ||
              "bg-gradient-to-r from-purple-600 to-pink-600",
            image: "🎯", // Default emoji, you can modify this logic
            imageUrl: rowData["Banner Images"] || "",
          };

          UI.banner.push(banner);
        }
      });

      console.log("Converted UI object:", UI);
      setUI(UI);
      return UI;
    } catch (err) {
      console.error("Detailed error:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  function getGoogleSheetId(url) {
    try {
      const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
      const match = url?.match(regex);

      if (match && match[1]) {
        return match[1];
      }
      router.push("/admin");
      return null;
    } catch (error) {
      router.push("/admin");
      console.error("Error extracting sheet ID:", error);
      return null;
    }
  }

  useEffect(() => {
    // This runs only on the client side after component mounts
    const storedExcel = sessionStorage.getItem("excelLink1");

    console.log("storedExcel", storedExcel);
    const id = getGoogleSheetId(storedExcel);
    if (id) {
      setSheetId(id);
      fetchAndConvertToProducts(id);
      fetchAndConvertToUI(id);
    } else {
      router.push("/admin");
      console.log("No name found in session storage");
    }
  }, []);

  const banners = [
    {
      id: 1,
      title: "Summer Sale - 50% Off",
      subtitle: "On all electronics and gadgets",
      bg: "bg-gradient-to-r from-purple-600 to-pink-600",
      image: "🎯",
      imageUrl:
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    },
    {
      id: 2,
      title: "New Arrivals",
      subtitle: "Fresh collection just landed",
      bg: "bg-gradient-to-r from-blue-600 to-cyan-600",
      image: "✨",
      imageUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    },
    {
      id: 3,
      title: "Free Shipping",
      subtitle: "On orders above $99",
      bg: "bg-gradient-to-r from-green-600 to-teal-600",
      image: "🚚",
    },
  ];

  // Categories
  // const categories = [
  //   "All",
  //   "Groceries",
  //   "Fashion",
  //   "Home & Garden",
  //   "Sports",
  //   "Books",
  //   "Beauty",
  // ];

  // const products = [
  //   {
  //     id: 1,
  //     name: "Wireless Headphones",
  //     price: 99.99,
  //     category: "Electronics",
  //     rating: 4.5,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 149.99,
  //     variants: {
  //       color: [
  //         { name: "Black", value: "black", priceModifier: 0 },
  //         { name: "White", value: "white", priceModifier: 20 },
  //         { name: "Blue", value: "blue", priceModifier: 15 },
  //       ],
  //       type: [
  //         { name: "Standard", value: "standard", priceModifier: 0 },
  //         { name: "Pro", value: "pro", priceModifier: 50 },
  //       ],
  //     },
  //   },
  //   {
  //     id: 2,
  //     name: "Summer Dress",
  //     price: 79.99,
  //     category: "Fashion",
  //     rating: 4.2,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 99.99,
  //     variants: {
  //       size: [
  //         { name: "S", value: "s", priceModifier: 0 },
  //         { name: "M", value: "m", priceModifier: 0 },
  //         { name: "L", value: "l", priceModifier: 5 },
  //         { name: "XL", value: "xl", priceModifier: 10 },
  //       ],
  //       color: [
  //         { name: "Red", value: "red", priceModifier: 0 },
  //         { name: "Blue", value: "blue", priceModifier: 0 },
  //         { name: "Green", value: "green", priceModifier: 5 },
  //       ],
  //     },
  //   },
  //   {
  //     id: 3,
  //     name: "Coffee Maker",
  //     price: 159.99,
  //     category: "Home & Garden",
  //     rating: 4.8,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 199.99,
  //     variants: {
  //       capacity: [
  //         { name: "4 Cup", value: "4cup", priceModifier: 0 },
  //         { name: "8 Cup", value: "8cup", priceModifier: 30 },
  //         { name: "12 Cup", value: "12cup", priceModifier: 50 },
  //       ],
  //     },
  //   },
  //   {
  //     id: 4,
  //     name: "Running Shoes",
  //     price: 129.99,
  //     category: "Sports",
  //     rating: 4.6,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 169.99,
  //     variants: {
  //       size: [
  //         { name: "7", value: "7", priceModifier: 0 },
  //         { name: "8", value: "8", priceModifier: 0 },
  //         { name: "9", value: "9", priceModifier: 0 },
  //         { name: "10", value: "10", priceModifier: 0 },
  //         { name: "11", value: "11", priceModifier: 0 },
  //       ],
  //       color: [
  //         { name: "Black", value: "black", priceModifier: 0 },
  //         { name: "White", value: "white", priceModifier: 10 },
  //         { name: "Red", value: "red", priceModifier: 15 },
  //       ],
  //     },
  //   },
  //   {
  //     id: 5,
  //     name: "Programming Book",
  //     price: 49.99,
  //     category: "Books",
  //     rating: 4.7,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 59.99,
  //     variants: {
  //       format: [
  //         { name: "Paperback", value: "paperback", priceModifier: 0 },
  //         { name: "Hardcover", value: "hardcover", priceModifier: 20 },
  //         { name: "Digital", value: "digital", priceModifier: -15 },
  //       ],
  //     },
  //   },
  //   {
  //     id: 6,
  //     name: "Face Cream",
  //     price: 39.99,
  //     category: "Beauty",
  //     rating: 4.3,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 54.99,
  //     variants: {
  //       size: [
  //         { name: "50ml", value: "50ml", priceModifier: 0 },
  //         { name: "100ml", value: "100ml", priceModifier: 20 },
  //         { name: "200ml", value: "200ml", priceModifier: 35 },
  //       ],
  //     },
  //   },
  //   {
  //     id: 7,
  //     name: "Smartphone",
  //     price: 699.99,
  //     category: "Electronics",
  //     rating: 4.4,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 799.99,
  //     variants: {
  //       storage: [
  //         { name: "128GB", value: "128gb", priceModifier: 0 },
  //         { name: "256GB", value: "256gb", priceModifier: 100 },
  //         { name: "512GB", value: "512gb", priceModifier: 200 },
  //       ],
  //       color: [
  //         { name: "Black", value: "black", priceModifier: 0 },
  //         { name: "White", value: "white", priceModifier: 0 },
  //         { name: "Blue", value: "blue", priceModifier: 50 },
  //       ],
  //     },
  //   },
  //   {
  //     id: 8,
  //     name: "Yoga Mat",
  //     price: 29.99,
  //     category: "Sports",
  //     rating: 4.1,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 39.99,
  //     variants: {
  //       thickness: [
  //         { name: "4mm", value: "4mm", priceModifier: 0 },
  //         { name: "6mm", value: "6mm", priceModifier: 10 },
  //         { name: "8mm", value: "8mm", priceModifier: 15 },
  //       ],
  //       color: [
  //         { name: "Purple", value: "purple", priceModifier: 0 },
  //         { name: "Pink", value: "pink", priceModifier: 5 },
  //         { name: "Blue", value: "blue", priceModifier: 5 },
  //       ],
  //     },
  //   },
  //   {
  //     id: 9,
  //     name: "Designer Bag",
  //     price: 199.99,
  //     category: "Fashion",
  //     rating: 4.9,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 299.99,
  //     variants: {
  //       color: [
  //         { name: "Black", value: "black", priceModifier: 0 },
  //         { name: "Brown", value: "brown", priceModifier: 25 },
  //         { name: "Red", value: "red", priceModifier: 30 },
  //       ],
  //       size: [
  //         { name: "Small", value: "small", priceModifier: 0 },
  //         { name: "Medium", value: "medium", priceModifier: 20 },
  //         { name: "Large", value: "large", priceModifier: 40 },
  //       ],
  //     },
  //   },
  //   {
  //     id: 10,
  //     name: "Plant Pot",
  //     price: 24.99,
  //     category: "Home & Garden",
  //     rating: 4.0,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 34.99,
  //     variants: {
  //       size: [
  //         { name: "Small", value: "small", priceModifier: 0 },
  //         { name: "Medium", value: "medium", priceModifier: 10 },
  //         { name: "Large", value: "large", priceModifier: 20 },
  //       ],
  //       material: [
  //         { name: "Ceramic", value: "ceramic", priceModifier: 0 },
  //         { name: "Terracotta", value: "terracotta", priceModifier: 5 },
  //       ],
  //     },
  //   },
  //   {
  //     id: 11,
  //     name: "Perfume",
  //     price: 89.99,
  //     category: "Beauty",
  //     rating: 4.5,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 119.99,
  //     variants: {
  //       size: [
  //         { name: "30ml", value: "30ml", priceModifier: 0 },
  //         { name: "50ml", value: "50ml", priceModifier: 30 },
  //         { name: "100ml", value: "100ml", priceModifier: 60 },
  //       ],
  //     },
  //   },
  //   {
  //     id: 12,
  //     name: "Cookbook",
  //     price: 34.99,
  //     category: "Books",
  //     rating: 4.6,
  //     image:
  //       "https://rukminim2.flixcart.com/image/612/612/xif0q/t-shirt/y/d/2/m-polo-8016-kajaru-original-imah8qyjz99gfng8.jpeg?q=70",
  //     originalPrice: 44.99,
  //     variants: {
  //       format: [
  //         { name: "Paperback", value: "paperback", priceModifier: 0 },
  //         { name: "Hardcover", value: "hardcover", priceModifier: 15 },
  //       ],
  //     },
  //   },
  // ];
  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced filter function that handles both category and search
  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === "All" || product.category === selectedCategory;

    const searchMatch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  // Get current page products
  const startIndex = currentPage * PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  // Reset to first page when category or search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, searchQuery]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  const addToCart = (product, selectedVariants = {}) => {
    const variantPrice = Object.values(selectedVariants).reduce(
      (total, variant) => {
        return total + variant.priceModifier;
      },
      0
    );

    const finalPrice = product.price + variantPrice;
    const finalOriginalPrice = product.originalPrice + variantPrice;

    const cartItem = {
      id: `${product.id}-${
        Object.values(selectedVariants)
          .map((v) => v.value)
          .join("-") || "default"
      }`,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: finalOriginalPrice,
      image: product.image,
      category: product.category,
      variants: selectedVariants,
      quantity: 1,
    };

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === cartItem.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, cartItem];
      }
    });

    // Show cart notification
    setCartNotification(cartItem);
    setShowNotification(true);

    // Hide notification after 2 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const toggleWishlist = (productId) => {
    setWishlistedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  function isHTTPURL(string) {
    return /^https?:\/\//i.test(string);
  }

  const CartModal = () => {
    if (!isCartOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
        <div className="bg-white w-full max-w-md h-full overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center text-gray-800">
              <h2 className="text-xl font-bold">Shopping Cart</h2>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
                  >
                    {/* <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-2xl"> */}
                    <img
                      className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center "
                      src={item.image}
                    />
                    {/* </div> */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </h4>
                      {Object.keys(item.variants).length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {Object.entries(item.variants).map(
                            ([type, variant]) => (
                              <span key={type} className="mr-2">
                                {variant.name}
                              </span>
                            )
                          )}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-bold text-sm text-indigo-600">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 hover:bg-red-100 text-red-500 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>
              <button
                style={{
                  backgroundImage: `linear-gradient(to right, ${UI?.button?.bgColor})`,
                  color: UI?.button?.textColor,
                }}
    
    
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Notification Slide */}
      <div
        className={`fixed top-20 right-0 z-50 transform transition-transform duration-300 ease-in-out ${
          showNotification ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {cartNotification && (
          <div className="bg-white shadow-xl rounded-l-lg border-l-4 border-green-500 p-4 m-4 w-80">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <img
                    className="h-full object-contain rounded-full"
                    src={cartNotification.image}
                  />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    Added to Cart!
                  </p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-sm text-gray-700 font-semibold">
                  {cartNotification.name}
                </p>
                <p className="text-sm text-green-600 font-bold">
                  ${cartNotification.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      <nav
        style={{
          backgroundColor: UI?.navbar?.bgColor || "#fff", // gray-800 equivalent
        }}
        className="bg-white shadow-lg sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center text-black">
              <div className="flex-shrink-0">
                {isHTTPURL(UI?.logo) ? (
                  <img className="h-12 object-contain" src={UI?.logo} />
                ) : (
                  <div
                    style={{
                      color: UI?.navbar?.iconColor || "#374151", // gray-800 equivalent
                    }}
                    className="text-2xl font-bold text-indigo-600"
                  >
                    {UI?.logo}
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-800" />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Icons */}
            <div
              style={{
                color: UI?.navbar?.iconColor || "#374151", // gray-800 equivalent
              }}
              className={`flex items-center space-x-4 text-gray-800`}
            >
              {/* Cart Icon */}
              <div
                className="relative cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-6 w-6" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </div>

              {/* Profile Icon */}
              <div className="cursor-pointer hover:text-indigo-600 transition-colors">
                <User className="h-6 w-6" />
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden cursor-pointer">
                <Menu className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Carousel Banner */}
      <div className="relative h-96 overflow-hidden">
        {UI?.banner?.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? "translate-x-0" : "translate-x-full"
            }`}
            style={{
              transform: `translateX(${(index - currentSlide) * 100}%)`,
            }}
          >
            {/* Background - either image or gradient */}
            {banner.imageUrl ? (
              <div className="relative h-full">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                style={{
                  backgroundImage: `linear-gradient(to right, ${banner?.bg})`,
                }}
                className={`h-full `}
              ></div>
            )}

            {/* Content positioned on the left */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-lg text-white">
                  {/* Emoji icon for gradient banners */}
                  {!banner.imageUrl && (
                    <div className="text-6xl mb-4">{banner.image}</div>
                  )}
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    {banner.title}
                  </h2>
                  <p className="text-lg md:text-xl mb-8 text-gray-100">
                    {banner.subtitle}
                  </p>
                  <button className="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {/* {Array.from(categories).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))} */}

            {Array.from(categories).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : selectedCategory === "All"
              ? "All Products"
              : selectedCategory}
          </h2>
          <p className="text-gray-600 mt-1">
            Showing {currentProducts.length} of {filteredProducts.length}{" "}
            products
            {totalPages > 1 && ` • Page ${currentPage + 1} of ${totalPages}`}
          </p>
          {searchQuery && filteredProducts.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                No products found for "{searchQuery}". Try searching for
                something else.
              </p>
            </div>
          )}
        </div>

        {/* Product Grid - Now using the separated ProductCard component */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {currentProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              wishlistedItems={wishlistedItems}
              onToggleWishlist={toggleWishlist}
              UI={UI}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 space-x-4">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300"
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === index
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage === totalPages - 1}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === totalPages - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ShopHub</h3>
              <p className="text-gray-400">
                Your one-stop destination for quality products at amazing
                prices.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Electronics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Fashion
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Home & Garden
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ShopHub. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <CartModal />
    </div>
  );
};

export default EcommerceHomepage;
