<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class CartItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Cart::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Cart $cart = null;

    #[ORM\ManyToOne(targetEntity: AnonymousCart::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?AnonymousCart $anonymousCart = null;

    #[ORM\ManyToOne(targetEntity: Product::class)]
    #[ORM\JoinColumn(nullable: false)]
    private Product $product;

    #[ORM\ManyToOne(targetEntity: Model::class)]
    #[ORM\JoinColumn(nullable: false,  onDelete: "CASCADE")]
    private Model $model;

    #[ORM\Column(type: 'integer')]
    private int $quantity;

    #[ORM\Column(type: 'float')]
    private float $price;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $promoPrice = null;

    #[ORM\Column]
    private ?bool $giftWrap = false;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCart(): ?Cart
    {
        return $this->cart;
    }

    public function setCart(?Cart $cart): self
    {
      
        if ($this->cart !== null && $this->cart !== $cart) {
            $this->cart->removeItem($this);
        }

        $this->cart = $cart;

        if ($cart !== null && !$cart->getItems()->contains($this)) {
            $cart->addItem($this);
        }

        return $this;
    }

    public function getAnonymousCart(): ?AnonymousCart
    {
        return $this->anonymousCart;
    }

    public function setAnonymousCart(?AnonymousCart $anonymousCart): self
    {
        if ($this->anonymousCart !== null && $this->anonymousCart !== $anonymousCart) {
            $this->anonymousCart->removeItem($this);
        }

        $this->anonymousCart = $anonymousCart;

        if ($anonymousCart !== null && !$anonymousCart->getItems()->contains($this)) {
            $anonymousCart->addItem($this);
        }

        return $this;
    }

    public function getProduct(): Product
    {
        return $this->product;
    }

    public function setProduct(Product $product): self
    {
        $this->product = $product;
        return $this;
    }

    public function getModel(): Model
    {
        return $this->model;
    }

    public function setModel(Model $model): self
    {
        $this->model = $model;
        return $this;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): self
    {
        $this->quantity = $quantity;
        return $this;
    }

    public function getPrice(): float
    {
        return $this->price;
    }

    public function setPrice(float $price): self
    {
        $this->price = $price;
        return $this;
    }

    public function getPromoPrice(): ?float {

        return $this->promoPrice;
    }

    public function setPromoPrice(?float $promoPrice): self {

        $this->promoPrice = $promoPrice;
        return $this;
    }

    public function isGiftWrap(): ?bool
    {
        return $this->giftWrap;
    }

    public function setGiftWrap(bool $giftWrap): static
    {
        $this->giftWrap = $giftWrap;

        return $this;
    }
}
