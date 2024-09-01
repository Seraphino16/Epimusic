<?php

namespace App\Entity;

use App\Repository\PromotionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PromotionRepository::class)]
class Promotion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $promo_price = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $start_date = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $end_date = null;

    #[ORM\ManyToOne(inversedBy: 'promotions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Product $product = null;

    #[ORM\OneToOne(inversedBy: 'promotion', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: true)] 
    private ?Model $model = null;


    #[ORM\Column(type: 'boolean')]
    private bool $is_active = true;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPromoPrice(): ?string
    {
        return $this->promo_price;
    }

    public function setPromoPrice(?string $promo_price): static
    {
        $this->promo_price = $promo_price;

        return $this;
    }

    public function getStartDate(): ?\DateTimeInterface
    {
        return $this->start_date;
    }

    public function setStartDate(\DateTimeInterface $start_date): static
    {
        $this->start_date = $start_date;

        return $this;
    }

    public function getEndDate(): ?\DateTimeInterface
    {
        return $this->end_date;
    }

    public function setEndDate(\DateTimeInterface $end_date): static
    {
        $this->end_date = $end_date;

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

    public function isActive(): bool
    {
        return $this->is_active;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->is_active = $isActive;

        return $this;
    }

    public function updateIsActive(): void
    {
        $now = new \DateTime();
        if ($this->end_date < $now) {
            $this->is_active = false;
        } else {
            $this->is_active = true;
        }
    }
}
