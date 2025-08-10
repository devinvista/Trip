#!/bin/bash

# Script para cadastrar atividades via API usando curl

BASE_URL="http://localhost:5000"

echo "🏃‍♂️ Iniciando cadastro de atividades via API..."

# Função para cadastrar uma atividade
cadastrar_atividade() {
    local title="$1"
    local description="$2"
    local destination_id="$3"
    local category="$4"
    local duration="$5"
    local cover_image="$6"
    local images="$7"
    
    echo "📝 Cadastrando: $title"
    
    curl -X POST "$BASE_URL/api/activities" \
        -H "Content-Type: application/json" \
        -d "{
            \"title\": \"$title\",
            \"description\": \"$description\",
            \"destination_id\": $destination_id,
            \"category\": \"$category\",
            \"difficulty_level\": \"easy\",
            \"duration\": \"$duration\",
            \"min_participants\": 1,
            \"max_participants\": 20,
            \"languages\": [\"Português\", \"Inglês\"],
            \"inclusions\": [\"Acompanhamento profissional\", \"Seguro básico\"],
            \"exclusions\": [\"Alimentação\", \"Transporte pessoal\"],
            \"requirements\": [\"Idade mínima: 12 anos\"],
            \"cancellation_policy\": \"Cancelamento gratuito até 24h antes\",
            \"contact_info\": {
                \"email\": \"contato@partiutrip.com\",
                \"phone\": \"+55 11 99999-9999\",
                \"whatsapp\": \"+55 11 99999-9999\"
            },
            \"cover_image\": \"$cover_image\",
            \"images\": $images,
            \"created_by_id\": 9
        }"
    
    echo -e "\n"
}

# Cadastrar propostas de orçamento
cadastrar_proposta() {
    local activity_id="$1"
    local title="$2"
    local description="$3"
    local amount="$4"
    local inclusions="$5"
    
    echo "💰 Cadastrando proposta: $title - R$ $amount"
    
    curl -X POST "$BASE_URL/api/activities/$activity_id/budget-proposals" \
        -H "Content-Type: application/json" \
        -d "{
            \"title\": \"$title\",
            \"description\": \"$description\",
            \"price_type\": \"per_person\",
            \"amount\": $amount,
            \"currency\": \"BRL\",
            \"inclusions\": $inclusions,
            \"exclusions\": [\"Despesas pessoais\", \"Gorjetas\"],
            \"is_active\": true
        }"
    
    echo -e "\n"
}

# Cadastrar review
cadastrar_review() {
    local activity_id="$1"
    local rating="$2"
    local review_text="$3"
    local photos="$4"
    
    echo "⭐ Cadastrando review: $rating estrelas"
    
    curl -X POST "$BASE_URL/api/activities/$activity_id/reviews" \
        -H "Content-Type: application/json" \
        -d "{
            \"rating\": $rating,
            \"review\": \"$review_text\",
            \"photos\": $photos,
            \"visit_date\": \"2024-12-15T00:00:00Z\"
        }"
    
    echo -e "\n"
}

# Primeiro, buscar o ID do destino Rio de Janeiro
echo "🔍 Buscando destino Rio de Janeiro..."
RIO_DEST_ID=$(curl -s "$BASE_URL/api/destinations" | grep -o '"id":[0-9]*,"name":"[^"]*[Rr]io[^"]*"' | head -1 | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$RIO_DEST_ID" ]; then
    echo "❌ Destino Rio de Janeiro não encontrado"
    exit 1
fi

echo "✅ Rio de Janeiro encontrado - ID: $RIO_DEST_ID"

# Cadastrar Cristo Redentor
echo -e "\n🏛️ Cadastrando Cristo Redentor..."
CRISTO_RESPONSE=$(cadastrar_atividade \
    "Cristo Redentor / Corcovado" \
    "Visita ao icônico Cristo Redentor no topo do Corcovado, uma das sete maravilhas do mundo moderno. Desfrute de vistas panorâmicas da cidade e baía de Guanabara." \
    "$RIO_DEST_ID" \
    "pontos_turisticos" \
    "3-4 horas" \
    "https://images.unsplash.com/photo-1539650116574-75c0c6d15f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000" \
    "[\"https://images.unsplash.com/photo-1539650116574-75c0c6d15f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800\"]")

echo "Cristo Redentor cadastrado!"

# Cadastrar Pão de Açúcar
echo -e "\n🏔️ Cadastrando Pão de Açúcar..."
PAO_RESPONSE=$(cadastrar_atividade \
    "Pão de Açúcar (Bondinho)" \
    "Passeio no famoso bondinho do Pão de Açúcar com vistas espetaculares da cidade, baía e praias. Inclui parada na Urca e no topo do Pão de Açúcar." \
    "$RIO_DEST_ID" \
    "pontos_turisticos" \
    "2-3 horas" \
    "https://images.unsplash.com/photo-1544737151-6e4b9ee48424?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000" \
    "[\"https://images.unsplash.com/photo-1544737151-6e4b9ee48424?ixlib=rb-4.0.3&auto=format&fit=crop&w=800\"]")

echo "Pão de Açúcar cadastrado!"

# Cadastrar Trilha
echo -e "\n🥾 Cadastrando Trilha Pedra Bonita..."
TRILHA_RESPONSE=$(cadastrar_atividade \
    "Trilha Pedra Bonita ou Dois Irmãos" \
    "Trilhas com as melhores vistas panorâmicas do Rio. Ideal para amantes da natureza e fotografia." \
    "$RIO_DEST_ID" \
    "hiking" \
    "4-6 horas" \
    "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000" \
    "[\"https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800\"]")

echo "Trilha cadastrada!"

echo -e "\n🎉 Cadastro de atividades concluído!"
echo "✅ 3 atividades foram cadastradas para o Rio de Janeiro"