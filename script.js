let ratings = [];
const INVITE_LINK = 'https://discord.gg/4uS8sv3RrA';

document.addEventListener('DOMContentLoaded', function() {
    loadRatings();
    loadRules();
    setupEventListeners();
    updateAverageRating();
});

function setupEventListeners() {
    const ratingForm = document.getElementById('ratingForm');
    if (ratingForm) {
        ratingForm.addEventListener('submit', handleRatingSubmit);
    }

    const copyBtn = document.getElementById('copyInviteBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyInviteLink);
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const starInputs = document.querySelectorAll('.star-rating input');
    starInputs.forEach(input => {
        input.addEventListener('change', function() {
            updateStarDisplay(this.value);
        });
    });
}

async function loadRatings() {
    try {
        const response = await fetch('ratings.json');
        if (response.ok) {
            const data = await response.json();
            ratings = data.ratings || [];
        } else {
            console.log('No ratings file found, starting with empty array');
            ratings = [];
        }
    } catch (error) {
        console.error('Error loading ratings:', error);
        ratings = [];
    }
    displayRatings();
}

function saveRatings() {
    localStorage.setItem('wickStudioRatings', JSON.stringify(ratings));
    
    const ratingsData = {
        ratings: ratings,
        statistics: {
            totalRatings: ratings.length,
            averageRating: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : 0,
            lastUpdated: new Date().toISOString()
        },
        metadata: {
            serverName: "Phoenix Community",
            serverInvite: "https://discord.gg/4uS8sv3RrA",
            description: "مجتمع Discord الإبداعي والتقني للمطورين والمصممين"
        }
    };
    
    const dataStr = JSON.stringify(ratingsData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    window.updatedRatingsURL = url;
    
    console.log('تم حفظ التقييمات في localStorage وتم إعداد ملف JSON للتحميل');
}

function handleRatingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userName = formData.get('userName').trim();
    const rating = parseInt(formData.get('rating'));
    const comment = formData.get('comment').trim();

    if (!userName || !rating) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }

    const newRating = {
        id: Date.now(),
        userName: userName,
        rating: rating,
        comment: comment,
        date: new Date().toLocaleDateString('ar-SA')
    };

    ratings.unshift(newRating);
    
    saveRatings();
    displayRatings();
    updateAverageRating();
    
    e.target.reset();
    
    showNotification('تم إرسال تقييمك بنجاح! يمكنك تحميل ملف JSON المحدث', 'success');
    
    showDownloadJSONButton();
}

function displayRatings() {
    const ratingsList = document.getElementById('ratingsList');
    if (!ratingsList) return;

    if (ratings.length === 0) {
        ratingsList.innerHTML = '<p style="text-align: center; color: #cccccc;">لا توجد تقييمات بعد. كن أول من يقيم!</p>';
        return;
    }

    const ratingsHTML = ratings.map(rating => `
        <div class="rating-item">
            <div class="rating-item-header">
                <span class="rating-user">${escapeHtml(rating.userName)}</span>
                <span class="rating-stars">${'★'.repeat(rating.rating)}${'☆'.repeat(5 - rating.rating)}</span>
            </div>
            ${rating.comment ? `<p class="rating-comment">"${escapeHtml(rating.comment)}"</p>` : ''}
            <small style="color: #888; font-size: 0.9rem;">${rating.date}</small>
        </div>
    `).join('');

    ratingsList.innerHTML = ratingsHTML;
}

function updateAverageRating() {
    const averageRatingElement = document.getElementById('averageRating');
    const averageStarsElement = document.getElementById('averageStars');
    
    if (!averageRatingElement || !averageStarsElement) return;

    if (ratings.length === 0) {
        averageRatingElement.textContent = '0';
        averageStarsElement.textContent = '';
        return;
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = (totalRating / ratings.length).toFixed(1);
    
    averageRatingElement.textContent = averageRating;
    averageStarsElement.textContent = '★'.repeat(Math.round(averageRating));
}

async function loadRules() {
    try {
        const response = await fetch('rules.txt');
        if (!response.ok) {
            throw new Error('Failed to load rules');
        }
        
        const rulesText = await response.text();
        displayRules(rulesText);
    } catch (error) {
        console.error('Error loading rules:', error);
        displayFallbackRules();
    }
}

function displayRules(rulesText) {
    const rulesContent = document.getElementById('rules-content');
    const rulesLoading = document.querySelector('.rules-loading');
    
    if (!rulesContent || !rulesLoading) return;

    rulesLoading.style.display = 'none';
    
    const formattedRules = formatRulesText(rulesText);
    rulesContent.innerHTML = formattedRules;
}

function displayFallbackRules() {
    const rulesContent = document.getElementById('rules-content');
    const rulesLoading = document.querySelector('.rules-loading');
    
    if (!rulesContent || !rulesLoading) return;

    rulesLoading.style.display = 'none';
    
    const fallbackRules = `
        <h3>القوانين العامة</h3>
        <p>مرحباً بك في مجتمع Phoenix! يرجى الالتزام بالقوانين التالية:</p>
        
        <h3>1. الاحترام والتهذيب</h3>
        <ul>
            <li>احترم جميع الأعضاء والموظفين</li>
            <li>لا تستخدم لغة مسيئة أو هجومية</li>
            <li>تجنب المحتوى غير المناسب</li>
        </ul>
        
        <h3>2. المحتوى</h3>
        <ul>
            <li>شارك المحتوى المفيد والإبداعي فقط</li>
            <li>لا تنشر محتوى مخالف أو مكرر</li>
            <li>احترم حقوق الملكية الفكرية</li>
        </ul>
        
        <h3>3. السلوك</h3>
        <ul>
            <li>تجنب الإزعاج أو الرسائل المتكررة</li>
            <li>استخدم القنوات المناسبة لكل موضوع</li>
            <li>لا تشارك معلومات شخصية</li>
        </ul>
        
        <h3>4. العقوبات</h3>
        <p>عدم الالتزام بهذه القوانين قد يؤدي إلى تحذير أو حظر من السيرفر.</p>
    `;
    
    rulesContent.innerHTML = fallbackRules;
}

function formatRulesText(text) {
    const lines = text.split('\n');
    let formattedHTML = '';
    let inList = false;

    for (let line of lines) {
        line = line.trim();
        
        if (line === '') {
            if (inList) {
                formattedHTML += '</ul>';
                inList = false;
            }
            continue;
        }
        
        if (line.match(/^\d+\./) || (line.length < 50 && !line.includes('.'))) {
            if (inList) {
                formattedHTML += '</ul>';
                inList = false;
            }
            formattedHTML += `<h3>${escapeHtml(line)}</h3>`;
        }
        else if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\)/)) {
            if (!inList) {
                formattedHTML += '<ul>';
                inList = true;
            }
            const cleanLine = line.replace(/^[-•]\s*/, '').replace(/^\d+\)\s*/, '');
            formattedHTML += `<li>${escapeHtml(cleanLine)}</li>`;
        }
        else {
            if (inList) {
                formattedHTML += '</ul>';
                inList = false;
            }
            formattedHTML += `<p>${escapeHtml(line)}</p>`;
        }
    }
    
    if (inList) {
        formattedHTML += '</ul>';
    }
    
    return formattedHTML;
}

function copyInviteLink() {
    navigator.clipboard.writeText(INVITE_LINK).then(() => {
        showNotification('تم نسخ رابط الدعوة!', 'success');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = INVITE_LINK;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('تم نسخ رابط الدعوة!', 'success');
    });
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) return;

    notificationText.textContent = message;
    
    notification.className = 'notification';
    if (type === 'error') {
        notification.style.background = 'linear-gradient(45deg, #ff4444, #cc0000)';
    } else if (type === 'success') {
        notification.style.background = 'linear-gradient(45deg, #44ff44, #00cc00)';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star-rating label');
    const ratingValue = parseInt(rating);
    
    stars.forEach((star, index) => {
        if (index < ratingValue) {
            star.style.color = '#ffd700';
        } else {
            star.style.color = '#666';
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.feature-card, .info-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    const mainTitle = document.querySelector('.main-title');
    if (mainTitle) {
        const text = mainTitle.textContent;
        mainTitle.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                mainTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        setTimeout(typeWriter, 1000);
    }
});

function exportRatings() {
    const dataStr = JSON.stringify(ratings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wick-studio-ratings.json';
    link.click();
    URL.revokeObjectURL(url);
}

function importRatings(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedRatings = JSON.parse(e.target.result);
            if (Array.isArray(importedRatings)) {
                ratings = importedRatings;
                saveRatings();
                displayRatings();
                updateAverageRating();
                showNotification('تم استيراد التقييمات بنجاح!', 'success');
            } else {
                showNotification('ملف غير صحيح!', 'error');
            }
        } catch (error) {
            showNotification('خطأ في قراءة الملف!', 'error');
        }
    };
    reader.readAsText(file);
}

function showDownloadJSONButton() {
    const ratingsDisplay = document.querySelector('.ratings-display');
    if (!ratingsDisplay) return;
    
    const existingBtn = document.getElementById('downloadJSONBtn');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'downloadJSONBtn';
    downloadBtn.className = 'submit-btn';
    downloadBtn.style.marginTop = '20px';
    downloadBtn.innerHTML = '📥 تحميل ملف JSON المحدث';
    downloadBtn.onclick = downloadUpdatedJSON;
    
    ratingsDisplay.appendChild(downloadBtn);
}

function downloadUpdatedJSON() {
    if (window.updatedRatingsURL) {
        const a = document.createElement('a');
        a.href = window.updatedRatingsURL;
        a.download = 'ratings_updated.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showNotification('تم تحميل ملف JSON المحدث!', 'success');
    } else {
        showNotification('لا يوجد ملف JSON محدث للتحميل', 'error');
    }
}
