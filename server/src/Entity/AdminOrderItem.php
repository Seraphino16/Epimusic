<?php

namespace App\Entity;

use App\Repository\AdminOrderItemRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AdminOrderItemRepository::class)]
class AdminOrderItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?AdminOrder $admin_order = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?Product $product = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?Model $model = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $modelId = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $modelColor = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $modelSize = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isMain;

    #[ORM\Column(type: 'integer')]
    private int $quantity;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAdminOrder(): ?AdminOrder
    {
        return $this->admin_order;
    }

    public function setAdminOrder(?AdminOrder $admin_order): static
    {
        $this->admin_order = $admin_order;

        return $this;
    }

    public function getProduct(): ?Product
    {
        return $this->product;
    }

    public function setProduct(Product $product): static
    {
        $this->product = $product;

        return $this;
    }

    public function getModel(): ?Model
    {
        return $this->model;
    }

    public function setModel(?Model $model): static
    {
        $this->model = $model;

        return $this;
    }

    public function getModelId(): ?int
    {
        return $this->model ? $this->model->getId() : null;
    }

    public function getModelColor(): ?string
    {
        return $this->modelColor;
    }

    public function setModelColor(?string $color): static
    {
        $this->modelColor = $color;
        return $this;
    }

    public function getModelSize(): ?string
    {
        return $this->modelSize;
    }

    public function setModelSize(?string $size): static
    {
        $this->modelSize = $size;
        return $this;
    }
    public function isMain(): bool
    {
        return $this->isMain;
    }

    public function setIsMain(bool $isMain): static
    {
        $this->isMain = $isMain;

        return $this;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): static
    {
        $this->quantity = $quantity;

        return $this;
    }


    public function getProductName(): ?string
    {
        return $this->product ? $this->product->getName() : null;
    }
}