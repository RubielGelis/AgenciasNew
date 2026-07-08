import fs from 'fs';
import path from 'path';

const filePath = 'c:\\Proyectos\\AgenciasNew\\src\\app\\dashboard\\invoices\\new\\invoice-form.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const replacement = `                            chargesAndTaxes: qData.chargesAndTaxes || 0,
                            state: qData.state || 'Nuevo',
                            items: (qData.products || []).map((p: any) => {
                                const safeAppliedTaxes = Array.isArray(p.appliedTaxes) ? p.appliedTaxes : [];
                                const safeVariables = Array.isArray(p.variables) ? p.variables : [];

                                const mainTaxId = p.mainTaxId;

                                // Inferir el precio desde el monto del cargo principal guardado
                                const mainTaxEntry = safeAppliedTaxes.find((t: any) => t.chargeAndTaxId === mainTaxId);
                                let inferredPrice = p.price;
                                if (mainTaxEntry && mainTaxEntry.explicitAmount != null) {
                                    inferredPrice = mainTaxEntry.explicitAmount / (p.quantity || 1);
                                }

                                return {
                                    productId: p.productId?.toString() || '',
                                    ticketCode: p.ticketCode || p.product?.code || '',
                                    ticketTypeId: p.ticketTypeId || '',
                                    quantity: p.quantity,
                                    price: inferredPrice,
                                    cost: p.cost || 0,
                                    providerId: p.providerId?.toString() || '',
                                    prestadoraId: p.prestadoraId?.toString() || '',
                                    checkIn: p.checkInDate ? new Date(p.checkInDate).toISOString().split('T')[0] : '',
                                    checkOut: p.checkOutDate ? new Date(p.checkOutDate).toISOString().split('T')[0] : '',
                                    paxAdults: p.paxAdults || 1,
                                    paxChildren: p.paxChildren || 0,
                                    destination: p.destination || '',
                                    serviceType: p.serviceType || '',
                                    reservationCode: p.reservationCode || '',
                                    passengers: Array.isArray(p.passengers) ? p.passengers : [],
                                    sellerCommission: p.sellerCommission || 0,
                                    ticketPrinterCommission: p.ticketPrinterCommission || 0,
                                    mainTaxId,
                                    inNationality: p.inNationality || 1,
                                    itemDescription: p.itemDescription || '',
                                    servicios: p.servicios || '',
                                    itinerary: p.itinerary || '',
                                    class: p.class || '',
                                    airline: p.airline || '',
                                    itinerariesItineraryList: Array.isArray(p.itinerariesItineraryList) ? p.itinerariesItineraryList : [],
                                    payments: Array.isArray(p.payments) ? p.payments : [],
                                    // Info extra para renderizado si el maestro no carga a tiempo
                                    _productName: p.product?.description,
                                    _providerName: p.provider?.name,
                                    _prestadoraName: p.prestadora?.name,
                                    appliedTaxes: safeAppliedTaxes.map((t: any) => ({
                                        chargeAndTaxId: t.chargeAndTaxId,
                                        amount: t.explicitAmount ?? 0
                                    })),
                                    variables: safeVariables.map((v: any) => ({
                                        id: v.id,
                                        masterVariableId: v.masterVariableId,
                                        value: v.value
                                    }))
                                }
                            }) || [],
                            selectedCombos: qData.combos?.map((c: any) => ({ id: c.comboId, name: c.combo?.name })) || []
                        })
                    }
                }
            } catch (err) {
                console.error("Failed to load generic or invoice data", err);
                setData({ clients: [], providers: [], prestadoras: [], branches: [], implants: [], products: [], taxes: [], sellers: [], ticketPrinters: [], variables: [], combos: [], currencies: [], creditCards: [], payments: [], ticketTypes: [] })
            }
        }
        loadInitialData()
    }, [invoiceId])`;

const targetRegex = /                            chargesAndTaxes: qData\.chargesAndTaxes \|\| 0,\s*}, \[invoiceId\]\)/;
content = content.replace(targetRegex, replacement);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("File fixed!");
