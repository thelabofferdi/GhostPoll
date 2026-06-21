import { ref } from 'vue'

export const useLanguage = () => {
    // Shared state
    const language = useState('locale', () => 'en')

    const toggleLanguage = () => {
        language.value = language.value === 'en' ? 'fr' : 'en'
    }

    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            // Navigation & Header
            'how_it_works': { en: 'How it works', fr: 'Comment ça marche' },
            'active_polls_badge': { en: '1,000+ Active Polls Today', fr: '1 000+ Sondages Actifs Aujourd\'hui' },
            
            // Hero Section
            'hero_line1': { en: 'Polls that', fr: 'Sondages qui' },
            'hero_line2': { en: 'disappear', fr: 'disparaissent' },
            'hero_line3': { en: 'into the', fr: 'dans le' },
            'hero_void': { en: 'void.', fr: 'néant.' },
            'hero_subtitle': { 
                en: 'Honest, private, and ephemeral polls for Indie Hackers. No tracking, no signup, just pure feedback that vanishes after 24h.',
                fr: 'Sondages honnêtes, privés et éphémères pour Indie Hackers. Aucun tracking, aucune inscription, juste des retours purs qui disparaissent après 24h.'
            },
            'start_ghost_poll': { en: 'Start a Ghost Poll', fr: 'Créer un Sondage Fantôme' },
            
            // Feature Pills
            'privacy_first': { en: 'Privacy-first', fr: 'Confidentialité d\'abord' },
            'auto_deleted': { en: 'Auto-deleted after 24h', fr: 'Auto-supprimé après 24h' },
            'no_signup': { en: 'No Signup Required', fr: 'Aucune Inscription Requise' },
            
            // How It Works Section
            'how_works_title': { en: 'How it works', fr: 'Comment ça marche' },
            'how_works_subtitle': { 
                en: 'Three simple steps to start ghosting your audience. Create, share, and watch it disappear.',
                fr: 'Trois étapes simples pour commencer à fantômiser votre audience. Créez, partagez et regardez disparaître.'
            },
            
            // Step 1: Conjure
            'step_conjure': { en: 'Conjure', fr: 'Invoquer' },
            'step_conjure_desc': { 
                en: 'Create a poll in seconds. Define your question and choose your mode. No login required. Just pure, instant interaction.',
                fr: 'Créez un sondage en quelques secondes. Définissez votre question et choisissez votre mode. Aucune connexion requise. Juste une interaction pure et instantanée.'
            },
            'no_login_required': { en: 'No login required.', fr: 'Aucune connexion requise.' },
            
            // Step 2: Haunt
            'step_haunt': { en: 'Haunt', fr: 'Hanter' },
            'step_haunt_desc': { 
                en: 'Share the ephemeral link on Twitter, Slack, or Discord. It lives everywhere for 24 hours. The clock starts ticking instantly.',
                fr: 'Partagez le lien éphémère sur Twitter, Slack ou Discord. Il vit partout pendant 24 heures. Le chrono démarre instantanément.'
            },
            'clock_ticking': { en: 'The clock starts ticking instantly.', fr: 'Le chrono démarre instantanément.' },
            
            // Step 3: Vanish
            'step_vanish': { en: 'Vanish', fr: 'Disparaître' },
            'step_vanish_desc': { 
                en: 'As soon as the timer hits zero, results disappear into the void. Forever. No traces left. Data is wiped clean.',
                fr: 'Dès que le chrono atteint zéro, les résultats disparaissent dans le néant. Pour toujours. Aucune trace. Les données sont effacées.'
            },
            'no_traces': { en: 'No traces left.', fr: 'Aucune trace.' },
            
            'start_poll': { en: 'Start a Poll', fr: 'Créer un Sondage' },
            
            // Perfect For Section
            'perfect_for': { en: 'Perfect for...', fr: 'Parfait pour...' },
            'perfect_for_subtitle': { en: 'Tailored for every scenario, from quick decisions to deep insights.', fr: 'Adapté à chaque scénario, des décisions rapides aux analyses approfondies.' },
            
            'quick_decisions': { en: 'Quick Decisions', fr: 'Décisions Rapides' },
            'quick_decisions_desc': { en: 'Settle team debates about features or lunch spots without keeping a permanent record.', fr: 'Réglez les débats d\'équipe sur les fonctionnalités ou les lieux de déjeuner sans garder de trace permanente.' },
            
            'sensitive_feedback': { en: 'Sensitive Feedback', fr: 'Retours Sensibles' },
            'sensitive_feedback_desc': { en: 'Get honest opinions on prototypes knowing the data won\'t haunt you later.', fr: 'Obtenez des avis honnêtes sur les prototypes en sachant que les données ne vous hanteront pas plus tard.' },
            
            // Create Poll Form
            'create_poll': { en: 'Create Poll', fr: 'Créer un Sondage' },
            'poll_type': { en: 'Poll Type', fr: 'Type de Sondage' },
            'emoji_vote': { en: 'Emoji Vote', fr: 'Vote Emoji' },
            'emoji_vote_desc': { en: 'Quick feedback with 5 reactions', fr: 'Retour rapide avec 5 réactions' },
            'multiple_choice': { en: 'Multiple Choice', fr: 'Choix Multiple' },
            'multiple_choice_desc': { en: 'Custom options for group decisions', fr: 'Options personnalisées pour décisions de groupe' },
            
            'poll_question': { en: 'Poll Question *', fr: 'Question du Sondage *' },
            'question_optional': { en: 'Question (Optional)', fr: 'Question (Optionnelle)' },
            'placeholder_poll': { en: 'Ex: What time should we meet?', fr: 'Ex : À quelle heure devrait-on se rencontrer ?' },
            'placeholder_emoji': { en: 'Ex: How was the demo?', fr: 'Ex : Comment était la démo ?' },
            
            'options': { en: 'Options', fr: 'Options' },
            'option': { en: 'Option', fr: 'Option' },
            'add_option': { en: 'Add option', fr: 'Ajouter une option' },
            
            'settings': { en: 'Settings', fr: 'Paramètres' },
            'single_vote': { en: 'Single Vote', fr: 'Vote Unique' },
            'single_vote_desc': { en: 'One person = one vote (recommended)', fr: 'Une personne = un vote (recommandé)' },
            'allow_revote': { en: 'Allow Revote', fr: 'Autoriser Revote' },
            'allow_revote_desc': { en: 'Participants can change their mind', fr: 'Les participants peuvent changer d\'avis' },
            
            'visibility': { en: 'Visibility', fr: 'Visibilité' },
            'live_results': { en: 'Live Results', fr: 'Résultats en Direct' },
            'live_results_desc': { en: 'Everyone sees results immediately', fr: 'Tout le monde voit les résultats immédiatement' },
            'ghost_reveal': { en: 'Ghost Reveal 👻', fr: 'Révélation Fantôme 👻' },
            'ghost_reveal_desc': { en: 'Results hidden until YOU reveal them', fr: 'Résultats cachés jusqu\'à ce que VOUS les révéliez' },
            'new_badge': { en: 'New', fr: 'Nouveau' },
            
            'duration': { en: 'Duration', fr: 'Durée' },
            'duration_1h': { en: '1 hour', fr: '1 heure' },
            'duration_6h': { en: '6 hours', fr: '6 heures' },
            'duration_12h': { en: '12 hours', fr: '12 heures' },
            'duration_24h': { en: '24 hours', fr: '24 heures' },
            'duration_48h': { en: '48 hours', fr: '48 heures' },
            
            'creating': { en: 'Creating...', fr: 'Création...' },
            'create_poll_btn': { en: 'Create Poll', fr: 'Créer le Sondage' },
            
            // Footer
            'footer_text': { en: 'No rights reserved. It\'s ephemeral.', fr: 'Aucun droit réservé. C\'est éphémère.' },
            
            // Existing translations
            'loading': { en: 'Loading...', fr: 'Chargement...' },
            'conjuring': { en: 'Conjuring poll...', fr: 'Invocation du sondage...' },
            'error': { en: 'Error', fr: 'Erreur' },
            'try_again': { en: 'Try Again', fr: 'Réessayer' },
            'vote_recorded': { en: 'Vote Recorded', fr: 'Vote Enregistré' },
            'feedback_void': { en: 'Your feedback has been cast into the void.', fr: 'Votre avis a été jeté dans le néant.' },
            'cast_vote': { en: 'Cast Vote', fr: 'Voter' },
            'choose_option': { en: 'Choose an option', fr: 'Choisissez une option' },
            'how_feel': { en: 'How do you feel?', fr: 'Comment vous sentez-vous ?' },
            'results_disappear': { en: 'The results will disappear when the timer hits zero.', fr: 'Les résultats disparaîtront quand le chrono atteindra zéro.' },
            'show_results': { en: 'Show live results', fr: 'Voir les résultats' },
            'hide_results': { en: 'Hide live results', fr: 'Masquer les résultats' },
            'detailed_results': { en: 'Detailed Results', fr: 'Résultats Détaillés' },
            'responses': { en: 'responses', fr: 'réponses' },
            'votes': { en: 'votes', fr: 'votes' },
            'access_denied': { en: 'Access Denied', fr: 'Accès Refusé' },
            'locked': { en: 'Locked', fr: 'Verrouillé' },
            'back_home': { en: 'Back to Home', fr: 'Retour à l\'accueil' },
            'question': { en: 'Question', fr: 'Question' },
            'total_votes': { en: 'Total votes', fr: 'Total des votes' },
            'top_vote': { en: 'Top vote', fr: 'Meilleur vote' },
            'share': { en: 'Share', fr: 'Partager' },
            'actions': { en: 'Actions', fr: 'Actions' },
            'open_page': { en: 'Open voting page', fr: 'Ouvrir la page de vote' },
            'export': { en: 'Export (JSON)', fr: 'Exporter (JSON)' },
            'lock': { en: 'Lock', fr: 'Verrouiller' },
            'unlock': { en: 'Unlock', fr: 'Deverrouiller' },
            'close_permanent': { en: 'Close Permanently', fr: 'Fermer Définitivement' },
            'share_image': { en: 'Share as Image', fr: 'Partager en Image' },
            'reveal': { en: 'Reveal Results', fr: 'Révéler les Résultats' },
            'hide_results_admin': { en: 'Hide Results', fr: 'Masquer les Résultats' },
            'make_results_public': { en: 'Make Results Public', fr: 'Rendre les Résultats Publics' },
            'extend_room': { en: 'Extend Room', fr: 'Prolonger la Room' },
            'extend_by': { en: 'Extend by', fr: 'Prolonger de' },
            'duplicate_poll': { en: 'Duplicate Poll', fr: 'Dupliquer le Sondage' },
            'export_json': { en: 'Export JSON', fr: 'Exporter JSON' },
            'export_csv': { en: 'Export CSV', fr: 'Exporter CSV' },
            'export_pdf': { en: 'Export PDF', fr: 'Exporter PDF' },
            'visibility_controls': { en: 'Visibility Controls', fr: 'Controle de Visibilite' },
            'admin_dashboard': { en: 'Admin Dashboard', fr: 'Tableau de Bord' },
            'generated_on': { en: 'Generated on', fr: 'Généré le' },
            'based_on': { en: 'Based on', fr: 'Basé sur' },
            'other_options': { en: 'other options', fr: 'autres options' },
            'official_results': { en: 'Official Results', fr: 'Résultats Officiels' },
            'untitled_poll': { en: 'Untitled Poll', fr: 'Sondage sans titre' },
            'vote_breakdown': { en: 'Vote Breakdown', fr: 'Répartition des votes' }
        }

        return translations[key]?.[language.value] || key
    }

    return {
        language,
        toggleLanguage,
        t
    }
}
