<?php

namespace App\Entity;

use App\Repository\CartRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: CartRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Cart
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'carts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\OneToMany(targetEntity: CartItem::class, mappedBy: 'cart', cascade: ['persist', 'remove'])]
    private Collection $items;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\Column(type: 'float')]
    private float $total = 0.0;

    #[ORM\Column(type: 'float', options: ['default' => 0])]
    private float $promoTotal = 0.0;

    public function __construct() {
        $this->items = new ArrayCollection();
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    /**
     * @return Collection<int, CartItem>
     */
    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(CartItem $item): self
    {
        if (!$this->items->contains($item)) {
            $this->items[] = $item;
            $item->setCart($this);
        }
        return $this;
    }

    public function removeItem(CartItem $item): self
    {   
        if ($this->items->removeElement($item)) {

            if ($item->getCart() === $this) {
                $item->setCart(null);
            }
        }

        return $this;
    }
        // $exitingItem = null;

        // foreach ($this->items as $i) {

        //     if ($i->getProduct() === $item->getProduct() 
        //         && $i->getModel() === $item->getModel()) {

        //         $exitingItem = $i;
        //         break;
        //     }
        // }

        // if ($existingItem !== null) {

        //     $currentQuantity = $existingItem->getQuantity();
        //     $newQuantity = $currentQuantity + $item->getQuantity();
        //     $existingItem->setQuantity($newQuantity);
        // } else {
        //     if (!$this->items->contains($item)) {
        //         $this->items[] = $item;
        //         $item->setCart($this);
        //     }
        // }

        // $this->calculateTotal();
        // return $this;
    // }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        if ($this->createdAt === null) {
            $this->createdAt = new \DateTime();
        }
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTime();
    }

    public function getTotal(): float
    {
        return $this->total;
    }

    public function getPromoTotal(): float {

        return $this->promoTotal;
    }

    public function setPromoTotal(float $promoTotal): self {

        $this->promoTotal = $promoTotal;
        return $this;
    }

    public function calculateTotal(): void
    {
        $total = 0.0;
        $promoTotal = 0.0;

        foreach ($this->items as $item) {
            $total += $item->getPrice() * $item->getQuantity();
            if ($item->getPromoPrice() !== null) {
                $promoTotal += $item->getQuantity() * ($item->getPrice() - $item->getPromoPrice());
            }
        }
        $this->total = $total;
        $this->promoTotal = $promoTotal;
    }
}
