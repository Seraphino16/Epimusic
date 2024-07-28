<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType; 
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\IsTrue;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Regex;
use Symfony\Component\Validator\Constraints\Email;

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
        ->add('email', EmailType::class, [
            'constraints' => [
                new NotBlank([
                    'message' => 'Please enter an email address',
                ]),
                new Email([
                    'message' => 'Please enter a valid email address',
                ]),
            ],
            'attr' => [
                'placeholder' => 'Enter your email',
                'pattern' => '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 
            ],
        ])            
        ->add('agreeTerms', CheckboxType::class, [
                'mapped' => false,
                'constraints' => [
                    new IsTrue([
                        'message' => 'You should agree to our terms.',
                    ]),
                ],
            ])
           ->add('plainPassword', PasswordType::class, [
        'mapped' => false,
        'attr' => ['autocomplete' => 'new-password'],
        'constraints' => [
            new NotBlank([
                'message' => 'Please enter a password',
            ]),
            new Length([
                'min' => 8,
                'minMessage' => 'Your password should be at least {{ limit }} characters',
                'max' => 4096,
            ]),
            new Regex([
                'pattern' => '/[A-Z]/',
                'message' => 'Your password should contain at least one uppercase letter',
            ]),
            new Regex([
                'pattern' => '/[a-z]/',
                'message' => 'Your password should contain at least one lowercase letter',
            ]),
            new Regex([
                'pattern' => '/\d/',
                'message' => 'Your password should contain at least one number',
            ]),
            new Regex([
                'pattern' => '/[\W_]/',
                'message' => 'Your password should contain at least one special character',
            ]),
        ],
    ]);

    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
