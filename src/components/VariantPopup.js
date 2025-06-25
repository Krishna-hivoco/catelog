import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  Star,
  Heart,
  Search,
  Plus,
  Minus,
  X,
} from "lucide-react";

// ----- VariantPopup lifted to module scope -----
const VariantPopup = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    if (!isOpen) setSelectedVariants({});
  }, [isOpen]);

  const variantPrice = Object.values(selectedVariants).reduce(
    (sum, v) => sum + v.priceModifier,
    0
  );
  const currentPrice = product.price + variantPrice;
  const originalPrice = product.originalPrice + variantPrice;

  const canAddToCart = Object.keys(product.variants || {}).every((type) =>
    Boolean(selectedVariants[type])
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-3xl">
                {product.image}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                ${currentPrice.toFixed(2)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-green-600 font-medium mt-1">
              You save ${(originalPrice - currentPrice).toFixed(2)}
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Select Options:
            </h4>
            {Object.entries(product.variants).map(([type, options]) => (
              <div key={type}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {type}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setSelectedVariants((prev) => ({
                          ...prev,
                          [type]: opt,
                        }))
                      }
                      className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                        selectedVariants[type]?.value === opt.value
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105"
                          : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      <div className="font-medium">{opt.name}</div>
                      {opt.priceModifier !== 0 && (
                        <div className="text-xs mt-1">
                          {opt.priceModifier > 0 ? "+" : ""}${opt.priceModifier}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onAddToCart(product, selectedVariants)}
              disabled={!canAddToCart}
              className={`flex-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                canAddToCart
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {canAddToCart ? "Add to Cart" : "Select All Options"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
