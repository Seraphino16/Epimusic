<?php

namespace App\Command;

use App\Entity\Musicoin;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:create-musicoins',
    description: 'This command creates musicoins data for all users',
)]
class CreateMusicoinsCommand extends Command
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityMangager)
    {
        parent::__construct();

        $this->entityManager = $entityMangager;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $users = $this->entityManager->getRepository(User::class)->findAll();

        foreach ($users as $user) {
            if (!$user->getMusicoin()) {
                $musicoin = new Musicoin;
                $musicoin->setUser($user);

                $this->entityManager->persist($musicoin);
            }
        }

        $this->entityManager->flush();

        $io->success("Musicoins created for users successfully");

        return Command::SUCCESS;
    }
}
