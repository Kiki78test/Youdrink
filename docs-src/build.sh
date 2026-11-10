#!/bin/sh
# Régénère tous les PDF de la documentation (à lancer depuis docs-src/)
set -e
cd "$(dirname "$0")"
python3 checklist.py    && node topdf.js checklist.html    ../docs/01-pilotage/check-list.pdf         210mm 297mm "Check-list"
python3 services.py     && node topdf.js services.html     ../docs/01-pilotage/services-externes.pdf  210mm 297mm "Services externes"
python3 presentation.py && node topdf.js presentation.html ../docs/02-presentation/presentation-complete.pdf 254mm 142.875mm
python3 guide.py        && node topdf.js guide.html        ../docs/02-presentation/guide-complet.pdf  210mm 297mm "Guide complet"
python3 business.py     && node topdf.js business.html     ../docs/03-business/business-plan.pdf      210mm 297mm "Business plan"
python3 stamp.py
