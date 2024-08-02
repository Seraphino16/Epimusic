<?php

namespace App\Entity;

use App\Repository\CartItemRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: CartItemRepository::class)]
class CartItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Cart::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Cart $cart = null;

    #[ORM\ManyToOne(targetEntity: Product::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Product $product = null;

    #[ORM\Column(type: 'integer')]
    #[Assert\NotNull]
    #[Assert\Possitive]
    private int $quantity;

    #[ORM\Column(type: 'float')]
    #[Assert\NotNull]
    #[Assert\Possitive]
    private float $price;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCart(): ?Cart {

        return $cart;
    }

    public function setCart(?Cart $cart): self {

        $this->cart = $cart;

        return $this;
    }

    public function getProduct(): ?Product {

        return $product;
    }

    public function setProduct(?Product $product): self {

        $this->getProduct = $product;

        return $this;
    }

    public function getQuantity(): int {

        return $quantity;
    }

    public function setQuantity(int $quantity): self {

        $this->quantity = $quantity;

        return $this;
    }

    public function getPrice(): float {

        return $price;
    }

    public function setPrice(int $quantity): self {

        $this->price = $price;

        return $this;
    }


}
