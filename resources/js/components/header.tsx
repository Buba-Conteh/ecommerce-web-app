"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Heart, User, Menu, X } from "lucide-react"
import { Link , usePage} from "@inertiajs/react"
import { useCart } from "@/components/cart-provider"
import { CartModal } from "@/components/cart-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  wishlistCount?: number
}

interface User {
  name: string
  email: string
  avatar?: string
  joinDate?: string
  totalOrders?: number
  totalSpent?: string | number
}


export function Header({ wishlistCount = 0 }: HeaderProps) {
  const { props } = usePage()
  const auth = props.auth as { user: User } | undefined
  const user = auth?.user

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)
  const { state } = useCart()
  const cartItemsCount = state.itemCount

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/">
                <h1 className="font-serif text-2xl font-bold text-primary cursor-pointer">Luxe</h1>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/collections" className="text-foreground hover:text-primary transition-colors">
                  Collections
                </Link>
                <Link href="/new-arrivals" className="text-foreground hover:text-primary transition-colors">
                  New Arrivals
                </Link>
                <Link href="/sale" className="text-foreground hover:text-primary transition-colors">
                  Sale
                </Link>
                <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </nav>
            </div>

            {/* Search Bar */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 bg-card border-b border-border p-4 md:hidden">
                <div className="flex items-center gap-2">
                  <Input placeholder="Search products..." className="flex-1" autoFocus />
                  <Button size="sm">Search</Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              {/* Desktop Search */}
              <div className="hidden md:flex items-center gap-2">
                <Input placeholder="Search products..." className="w-64" />
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Search Toggle */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartModalOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>

              {user ? (
                <Link href="/user/profile">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || ""} />
                    <AvatarFallback className="text-2xl font-serif">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Link href="/login" className="text-primary no-underline outline-none hover:underline" tabIndex={5}>
                  Sign in
                </Link>
              )}
             

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-border">
              <div className="flex flex-col gap-4">
                <Link href="/collections" className="text-foreground hover:text-primary transition-colors">
                  Collections
                </Link>
                <Link href="/new-arrivals" className="text-foreground hover:text-primary transition-colors">
                  New Arrivals
                </Link>
                <Link href="/sale" className="text-foreground hover:text-primary transition-colors">
                  Sale
                </Link>
                <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link href="/orders" className="text-foreground hover:text-primary transition-colors">
                  My Orders
                </Link>
                <Link href="/user/profile" className="text-foreground hover:text-primary transition-colors">
                  My Profile
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      <CartModal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} />
    </>
  )
}
