import React, { useState } from "react";
import { ShoppingCart, Star, Heart, X, Plus, Minus } from "lucide-react";

// Variant Popup Component
const VariantPopup = ({ product, isOpen, onClose, onAddToCart,UI }) => {
  const [selectedVariants, setSelectedVariants] = useState({});

  const getCurrentPrice = () => {
    const variantPrice = Object.values(selectedVariants).reduce(
      (total, variant) => {
        return total + variant.priceModifier;
      },
      0
    );
    return product.price + variantPrice;
  };

  const getOriginalPrice = () => {
    const variantPrice = Object.values(selectedVariants).reduce(
      (total, variant) => {
        return total + variant.priceModifier;
      },
      0
    );
    return product.originalPrice + variantPrice;
  };

  const handleVariantChange = (variantType, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantType]: variant,
    }));
  };

  const canAddToCart = () => {
    return Object.keys(product.variants || {}).every(
      (variantType) => selectedVariants[variantType]
    );
  };

  const handleAddToCart = () => {
    if (canAddToCart()) {
      onAddToCart(product, selectedVariants);
      setSelectedVariants({});
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedVariants({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh]  overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              {/* <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-3xl">
                {product.image}
              </div> */}

              <img
                className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center "
                src={product.image}
                alt={product.name}
              />
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price Display */}
          <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                ${getCurrentPrice().toFixed(2)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                ${getOriginalPrice().toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-green-600 font-medium mt-1">
              You save ${(getOriginalPrice() - getCurrentPrice()).toFixed(2)}
            </p>
          </div>

          {/* Variants Selection */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Select Options:
            </h4>

            {Object.entries(product.variants).map(([variantType, options]) => (
              <div key={variantType}>
                <label className="block text-sm font-medium text-gray-700 mb-3 capitalize">
                  {variantType}
                  {selectedVariants[variantType] && (
                    <span className="ml-2 text-indigo-600 font-normal">
                      - {selectedVariants[variantType].name}
                      {selectedVariants[variantType].priceModifier > 0 && (
                        <span className="text-green-600">
                          {" "}
                          (+${selectedVariants[variantType].priceModifier})
                        </span>
                      )}
                      {selectedVariants[variantType].priceModifier < 0 && (
                        <span className="text-red-600">
                          {" "}
                          (${selectedVariants[variantType].priceModifier})
                        </span>
                      )}
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleVariantChange(variantType, option)}
                      className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                        selectedVariants[variantType]?.value === option.value
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105"
                          : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      <div className="font-medium">{option.name}</div>
                      {option.priceModifier !== 0 && (
                        <div
                          className={`text-xs mt-1 ${
                            selectedVariants[variantType]?.value ===
                            option.value
                              ? "text-indigo-100"
                              : option.priceModifier > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {option.priceModifier > 0 ? "+" : ""}$
                          {option.priceModifier}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selection Summary */}
          {Object.keys(selectedVariants).length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Your Selection:
              </h5>
              <div className="space-y-1">
                {Object.entries(selectedVariants).map(([type, variant]) => (
                  <div
                    key={type}
                    className="text-sm text-gray-600 flex justify-between"
                  >
                    <span className="capitalize">
                      {type}: {variant.name}
                    </span>
                    {variant.priceModifier !== 0 && (
                      <span
                        className={
                          variant.priceModifier > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {variant.priceModifier > 0 ? "+" : ""}$
                        {variant.priceModifier}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              style={{
                backgroundImage: `linear-gradient(to right, ${UI?.button?.bgColor})`,
                color: UI?.button?.textColor,
              }}
              onClick={handleAddToCart}
              disabled={!canAddToCart()}
              className={`flex-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                canAddToCart()
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {canAddToCart() ? "Add to Cart" : "Select All Options"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({
  product,
  onAddToCart,
  wishlistedItems,
  onToggleWishlist,
  UI
}) => {
  const [showVariantPopup, setShowVariantPopup] = useState(false);
  const isWishlisted = wishlistedItems.has(product.id);

  const handleAddToCart = () => {
    if (!product.variants || Object.keys(product.variants).length === 0) {
      // No variants, add directly
      onAddToCart(product, {});
    } else {
      // Show variant popup
      setShowVariantPopup(true);
    }
  };

  return (
    <>
      <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100 hover:border-indigo-200 hover:-translate-y-1 flex flex-col h-auto">
        {/* Image Section */}
        <div className="relative w-full h-48 md:h-56 flex-shrink-0">
          {/* Sale Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-gradient-to-r from-gray-600 to-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {Math.round(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                  100
              )}
              % OFF
            </span>
          </div>

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg text-gray-500 hover:text-red-500 hover:bg-white transition-all duration-200 hover:scale-110"
            >
              <Heart
                className={`h-4 w-4 ${
                  isWishlisted ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
          </div>

          <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <img
              className="  h-full object-contain"
              src={product.image}
              alt={product.name}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {/* Category Tag */}
            <div className="mb-3">
              <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            <h3
              style={{ color: UI?.product?.nameColor || "#000000" }}
              className="text-sm md:text-base font-bold  mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2"
            >
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center mb-3">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2 font-medium">
                ({product.rating})
              </span>
              <span className="text-xs text-gray-400 ml-1">• 127 reviews</span>
            </div>

            {/* Price */}
            <div className="mb-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-lg md:text-xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm md:text-base text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-green-600 font-medium mt-1">
                You save ${(product.originalPrice - product.price).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-2">
            <button
              style={{
                backgroundImage: `linear-gradient(to right, ${UI?.button?.bgColor})`,
                color: UI?.button?.textColor,
              }}
              onClick={handleAddToCart}
              className="w-full py-3 px-4 rounded-xl transition-all duration-200 font-semibold text-sm transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl   hover:from-gray-900 hover:to-black"
            >
              <div className="flex items-center justify-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {product.variants && Object.keys(product.variants).length > 0
                    ? "Choose Options"
                    : "Add to Cart"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Variant Popup */}
      <VariantPopup
        product={product}
        isOpen={showVariantPopup}
        onClose={() => setShowVariantPopup(false)}
        onAddToCart={onAddToCart}
        UI={UI}
      />
    </>
  );
};

export default ProductCard;
export { VariantPopup };
