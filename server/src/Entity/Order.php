<?php

namespace App\Entity;

use App\Repository\OrderRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: '`order`')]
class Order
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'float')]
    private $totalPrice;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private $paymentMethod;

    #[ORM\Column(type: 'string', length: 255)]
    private $paymentStatus;

    #[ORM\Column(type: 'string', length: 255)]
    private $status;

    #[ORM\Column(type: 'datetime')]
    private $createdAt;

    #[ORM\Column(type: 'datetime')]
    private $updatedAt;

    #[ORM\OneToMany(mappedBy: 'order', targetEntity: OrderItems::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private $orderItems;

    #[ORM\OneToOne(mappedBy: 'order', targetEntity: OrderAddress::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private $orderAddress;

    #[ORM\Column(nullable: true)]
    private ?float $ShippingCost = null;

    #[ORM\Column(nullable: true)]
    private ?float $totalWithPromo = null;

    #[ORM\Column(nullable: true)]
    private ?float $totalWithShippingCost = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'orders')]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function __construct()
    {
        $this->orderItems = new ArrayCollection();
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

    public function getPaymentMethod(): ?string
    {
        return $this->paymentMethod;
    }

    public function setPaymentMethod(string $paymentMethod): self
    {
        $this->paymentMethod = $paymentMethod;

        return $this;
    }

    public function getPaymentStatus(): ?string
    {
        return $this->paymentStatus;
    }

    public function setPaymentStatus(string $paymentStatus): self
    {
        $this->paymentStatus = $paymentStatus;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * @return Collection|OrderItems[]
     */
    public function getOrderItems(): Collection
    {
        return $this->orderItems;
    }

    public function addOrderItem(OrderItems $orderItem): self
    {
        if (!$this->orderItems->contains($orderItem)) {
            $this->orderItems[] = $orderItem;
            $orderItem->setOrder($this);
        }

        return $this;
    }

    public function removeOrderItem(OrderItems $orderItem): self
    {
        if ($this->orderItems->removeElement($orderItem)) {

            if ($orderItem->getOrder() === $this) {
                $orderItem->setOrder(null);
            }
        }

        return $this;
    }

    public function getOrderAddress(): ?OrderAddress
    {
        return $this->orderAddress;
    }

    public function setOrderAddress(?OrderAddress $orderAddress): self
    {
        if ($orderAddress === null && $this->orderAddress !== null) {
            $this->orderAddress->setOrder(null);
        }

        if ($orderAddress !== null && $orderAddress->getOrder() !== $this) {
            $orderAddress->setOrder($this);
        }

        $this->orderAddress = $orderAddress;

        return $this;
    }

    public function getShippingCost(): ?float
    {
        return $this->ShippingCost;
    }

    public function setShippingCost(?float $ShippingCost): static
    {
        $this->ShippingCost = $ShippingCost;

        return $this;
    }

    public function getTotalWithPromo(): ?float
    {
        return $this->totalWithPromo;
    }

    public function setTotalWithPromo(?float $totalWithPromo): static
    {
        $this->totalWithPromo = $totalWithPromo;

        return $this;
    }

    public function getTotalWithShippingCost(): ?float
    {
        return $this->totalWithShippingCost;
    }

    public function setTotalWithShippingCost(?float $totalWithShippingCost): static
    {
        $this->totalWithShippingCost = $totalWithShippingCost;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }
}