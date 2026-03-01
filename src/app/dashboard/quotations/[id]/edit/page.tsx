import QuotationForm from '../../new/quotation-form'

export default async function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div>
            <QuotationForm quotationId={id} />
        </div>
    )
}
