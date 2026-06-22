let leadData = {
    instagram: '',
    perfil: '',
    equipe: '',
    trafego: '',
    disponibilidade: '',
    nome: '',
    whatsapp: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: ''
};

// Capture UTM parameters from URL on page load
const urlParams = new URLSearchParams(window.location.search);
const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

utms.forEach(utm => {
    const value = urlParams.get(utm);
    if (value) {
        leadData[utm] = value;
        // Also populate the hidden inputs if they exist
        const hiddenField = document.getElementById(utm);
        if (hiddenField) {
            hiddenField.value = value;
        }
    }
});

// Handle visual selection of radio buttons
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function() {
        // Remove selected class from all labels in the same group
        const groupName = this.name;
        document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
            r.closest('.radio-label').classList.remove('selected');
        });
        // Add selected class to the parent label of the checked radio
        if (this.checked) {
            this.closest('.radio-label').classList.add('selected');
        }
    });
});

// Navigation functions
function nextStep(stepIndex) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${stepIndex}`).classList.add('active');
}

function prevStep(stepIndex) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${stepIndex}`).classList.add('active');
}

// Validation before moving to next step
function validateAndNext(currentStep, nextStepId) {
    const errorMsg = document.getElementById(`error-${currentStep}`);
    errorMsg.style.display = 'none';

    if (currentStep === 1) {
        const insta = document.getElementById('instagram').value.trim();
        if (!insta) {
            errorMsg.style.display = 'block';
            return;
        }
        leadData.instagram = insta;
    } else if (currentStep === 2) {
        const perfil = document.querySelector('input[name="perfil"]:checked');
        if (!perfil) {
            errorMsg.style.display = 'block';
            return;
        }
        leadData.perfil = perfil.value;
    } else if (currentStep === 3) {
        const equipe = document.querySelector('input[name="equipe"]:checked');
        if (!equipe) {
            errorMsg.style.display = 'block';
            return;
        }
        leadData.equipe = equipe.value;
    } else if (currentStep === 4) {
        const trafego = document.querySelector('input[name="trafego"]:checked');
        if (!trafego) {
            errorMsg.style.display = 'block';
            return;
        }
        leadData.trafego = trafego.value;
    }

    nextStep(nextStepId);
}

// Evaluate Qualification after step 5
function evaluateAndProceed() {
    const errorMsg = document.getElementById('error-5');
    errorMsg.style.display = 'none';

    const disp = document.querySelector('input[name="disponibilidade"]:checked');
    if (!disp) {
        errorMsg.style.display = 'block';
        return;
    }
    leadData.disponibilidade = disp.value;

    // --- Qualification Rules ---
    // Aprovado se:
    // - É empresário (empresario_equipe ou empresario_sozinho)
    // - Tem disponibilidade (sim)
    // Outros são reprovados
    
    let isQualified = true;

    if (leadData.perfil !== 'empresario_equipe' && leadData.perfil !== 'empresario_sozinho') {
        isQualified = false;
    }

    if (leadData.disponibilidade !== 'sim') {
        isQualified = false;
    }

    if (isQualified) {
        // Go to final step to collect name and whatsapp
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        document.getElementById('step-final').classList.add('active');
    } else {
        // Disqualified - redirect to finalizado page
        window.location.href = 'finalizado.html';
    }
}

// Submit Final Form
async function submitLead() {
    const errorMsg = document.getElementById('error-final');
    errorMsg.style.display = 'none';

    const nome = document.getElementById('nome').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();

    if (!nome || !whatsapp) {
        errorMsg.style.display = 'block';
        return;
    }

    leadData.nome = nome;
    leadData.whatsapp = whatsapp;

    // Loading state for button
    const btn = document.querySelector('.btn-large');
    const originalText = btn.innerText;
    btn.innerText = 'Enviando...';
    btn.disabled = true;

    try {
        const webhookUrl = 'https://merit-n8n.jcspip.easypanel.host/webhook/2a3a29e2-1d35-4d94-b276-f3f3ec9a10b0';
        
        await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leadData)
        });

        // Redirect to Success Page
        window.location.href = 'obrigado.html';
    } catch (error) {
        console.error("Erro ao enviar dados para o webhook:", error);
        alert("Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.");
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
