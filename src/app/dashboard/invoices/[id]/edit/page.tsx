import InvoiceForm from '../../new/invoice-form'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div>
            <InvoiceForm invoiceId={id} />
        </div>
    )
}
