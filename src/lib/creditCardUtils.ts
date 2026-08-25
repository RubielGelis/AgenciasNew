export interface CreditCardMaster {
    id: number;
    code: string;
    name: string;
    type?: string;
    inactive?: boolean;
}

export interface CreditCardParseResult {
    rawInput: string;
    cardCode?: string;
    cardNumber?: string;
    matchedCard?: CreditCardMaster;
    isValid: boolean;
    isCardFormat: boolean;
    errorMessage?: string;
}

/**
 * Extrae los 2 primeros caracteres del código de tarjeta (ej. "VI" de "VI0000000000007023")
 * y el número restante ("0000000000007023"), validándolo contra el Maestro de Tarjetas de Crédito.
 */
export function parseAndValidateCreditCard(
    input: string | undefined | null,
    creditCardsMaster: CreditCardMaster[] = []
): CreditCardParseResult {
    if (!input || !input.toString().trim()) {
        return { rawInput: '', isValid: true, isCardFormat: false };
    }

    const cleanInput = input.toString().trim();

    // Expresión regular para detectar 2 letras iniciales (ej. VI, MC, AX, DC, TP) seguidas de dígitos/texto
    const match = cleanInput.match(/^([A-Za-z]{2})[\s\-\:]*(.+)$/);

    if (match) {
        const candidateCode = match[1].toUpperCase();
        const candidateNumber = match[2].trim();

        const found = creditCardsMaster.find(
            c => c.code && c.code.trim().toUpperCase() === candidateCode
        );

        if (found) {
            return {
                rawInput: cleanInput,
                cardCode: candidateCode,
                cardNumber: candidateNumber,
                matchedCard: found,
                isValid: true,
                isCardFormat: true
            };
        } else {
            return {
                rawInput: cleanInput,
                cardCode: candidateCode,
                cardNumber: candidateNumber,
                isValid: false,
                isCardFormat: true,
                errorMessage: `El código de tarjeta "${candidateCode}" no está registrado en el Maestro de Tarjetas de Crédito.`
            };
        }
    }

    return {
        rawInput: cleanInput,
        cardNumber: cleanInput,
        isValid: true,
        isCardFormat: false
    };
}
