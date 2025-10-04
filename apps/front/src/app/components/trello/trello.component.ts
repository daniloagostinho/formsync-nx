import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
    selector: 'app-trello',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        FooterComponent
    ],
    templateUrl: './trello.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrelloComponent implements OnInit, AfterViewInit {

    constructor() { }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        // Animação removida - não está sendo usada
    }

    email: string = '';
    mobileMenuOpen: boolean = false;

    toggleMobileMenu(): void {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    closeMobileMenu(): void {
        this.mobileMenuOpen = false;
    }

    teams = [
        'Marketing teams',
        'Product management',
        'Engineering teams',
        'Design teams',
        'Startups',
        'Remote teams'
    ];

    useCases = [
        {
            title: 'Task management',
            description: 'Track progress of tasks in one convenient place with a visual layout that adds \'ta-da\' to your to-do\'s.'
        },
        {
            title: 'Resource hub',
            description: 'Save hours when you give teams a well-designed hub to find information easily and quickly.'
        },
        {
            title: 'Project management',
            description: 'Keep projects organized, deadlines on track, and teammates aligned with Trello.'
        }
    ];

    plans = [
        {
            name: 'Standard',
            description: 'For teams that need to manage more work and scale collaboration.',
            price: '$5',
            period: 'per user/month',
            features: ['Everything in Free', 'Unlimited boards', 'Advanced checklists', 'Custom Fields', 'Unlimited storage (250MB/file)', '1,000 Workspace command runs per month', 'Single board guests', 'Saved searches']
        },
        {
            name: 'Premium',
            description: 'Best for teams up to 100 that need to track multiple projects and visualize work in a variety of ways.',
            price: '$10',
            period: 'per user/month',
            features: ['Everything in Standard', 'Views: Calendar, Timeline, Table, Dashboard, and Map', 'Collections', 'Admin and security features', 'Workspace-level templates', 'Collections', 'Advanced admin controls', 'Priority support']
        },
        {
            name: 'Enterprise',
            description: 'Everything your enterprise teams and admins need to manage projects.',
            price: '$17.50',
            period: 'per user/month',
            features: ['Everything in Premium', 'Unlimited Workspaces', 'Organization-wide permissions', 'Organization-wide boards', 'Public board management', 'Multi-board guests', 'Advanced security controls', 'Admin controls', 'Priority support']
        }
    ];

    testimonials = [
        {
            quote: 'Trello is great for simplifying complex processes. As a manager, I can chunk processes down into bite-sized pieces for my team and then delegate that out, but still keep a bird\'s-eye view.',
            author: 'Joey Rosenberg',
            role: 'Global Leadership Director at Women Who Code',
            company: 'Women Who Code'
        },
        {
            quote: 'Whether someone is in the office, working from home, or working on-site with a client, everyone can share context and information through Trello.',
            author: 'Sumeet Moghe',
            role: 'Product Manager at ThoughtWorks',
            company: 'ThoughtWorks'
        },
        {
            quote: 'We used Trello to provide clarity on steps, requirements, and procedures. This was exceptional when communicating with teams that had deep cultural and language differences.',
            author: 'Jefferson Scomacao',
            role: 'Development Manager at IKEA/PTC',
            company: 'PTC'
        }
    ];

    stats = [
        { value: '75%', description: 'of organizations report that Trello delivers value to their business within 30 days.' },
        { value: '81%', description: 'of customers chose Trello for its ease of use.' },
        { value: '74%', description: 'of customers say Trello has improved communication with their co-workers and teams.' }
    ];

    companies = [
        'Visa', 'Coinbase', 'John Deere', 'Zoom', 'Grand Hyatt', 'Fender'
    ];

    onSignUp() {
        if (this.email) {
            console.log('Sign up with email:', this.email);
            // Implementar lógica de cadastro aqui
        }
    }

    // Métodos de animação removidos - não estão sendo usados
}
