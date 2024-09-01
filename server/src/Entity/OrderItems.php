<?php

namespace App\Entity;

use App\Repository\OrderItemsRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrderItemsRepository::class)]
class OrderItems
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    private $productName;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private $color;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private $size;

    #[ORM\Column(type: 'integer')]
    private $quantity;

    #[ORM\Column(type: 'integer')]
    private $unitPrice;

    #[ORM\Column(type: 'float')]
    private $totalPrice;

    #[ORM\Column(type: 'float', nullable: true)]
    private $totalPromoPrice;

    #[ORM\Column(type: 'boolean')]
    private $giftWrap;

    #[ORM\ManyToOne(targetEntity: Order::class, inversedBy: 'orderItems')]
    #[ORM\JoinColumn(nullable: false)]
    private $order;

    #[ORM\Column(nullable: true)]
    private ?float $unitPromoPrice = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Product $product = null;


    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProductName(): ?string
    {
        return $this->productName;
    }

    public function setProductName(string $productName): self
    {
        $this->productName = $productName;

        return $this;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(?string $color): self
    {
        $this->color = $color;

        return $this;
    }

    public function getSize(): ?string
    {
        return $this->size;
    }

    public function setSize(?string $size): self
    {
        $this->size = $size;

        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): self
    {
        $this->quantity = $quantity;

        return $this;
    }

    public function getUnitPrice(): ?int
    {
        return $this->unitPrice;
    }

    public function setUnitPrice(int $unitPrice): self
    {
        $this->unitPrice = $unitPrice;

        return $this;
    }

    public function getTotalPrice(): ?float
    {
        return $this->totalPrice;
    }

    public function setTotalPrice(float $totalPrice): self
    {
        $this->totalPrice = $totalPrice;

        return $this;
    }

    public function getTotalPromoPrice(): ?float
    {
        return $this->totalPromoPrice;
    }

    public function setTotalPromoPrice(?float $totalPromoPrice): self
    {
        $this->totalPromoPrice = $totalPromoPrice;

        return $this;
    }

    public function getGiftWrap(): ?bool
    {
        return $this->giftWrap;
    }

    public function setGiftWrap(bool $giftWrap): self
    {
        $this->giftWrap = $giftWrap;

        return $this;
    }

    public function getOrder(): ?Order
    {
        return $this->order;
    }

    public function setOrder(?Order $order): self
    {
        $this->order = $order;

        return $this;
    }

    public function getUnitPromoPrice(): ?float
    {
        return $this->unitPromoPrice;
    }

    public function setUnitPromoPrice(?float $unitPromoPrice): static
    {
        $this->unitPromoPrice = $unitPromoPrice;

        return $this;
    }

    public function getProduct(): ?Product
    {
        return $this->product;
    }

    public function setProduct(?Product $product): static
    {
        $this->product = $product;

        return $this;
    }
}