do $$
BEGIN
	CREATE TABLE IF NOT EXISTS public."Attachment"
	(
	    id integer NOT NULL DEFAULT nextval('"Attachment_id_seq"'::regclass),
	    "quotationId" integer NOT NULL,
	    "fileName" text COLLATE pg_catalog."default" NOT NULL,
	    "fileType" text COLLATE pg_catalog."default" NOT NULL,
	    "fileSize" integer NOT NULL,
	    "fileContent" bytea NOT NULL,
	    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	    CONSTRAINT "Attachment_pkey" PRIMARY KEY (id),
	    CONSTRAINT "Attachment_quotationId_fkey" FOREIGN KEY ("quotationId")
	        REFERENCES public."Quotation" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE CASCADE
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Attachment" OWNER to postgres;

	CREATE TABLE IF NOT EXISTS public."Branch"
	(
	    id integer NOT NULL DEFAULT nextval('"Branch_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default" NOT NULL,
	    name text COLLATE pg_catalog."default" NOT NULL,
	    CONSTRAINT "Branch_pkey" PRIMARY KEY (id)
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Branch"
	    OWNER to postgres;
	
	CREATE UNIQUE INDEX IF NOT EXISTS "Branch_code_key"
	    ON public."Branch" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	    TABLESPACE pg_default;

	CREATE TABLE IF NOT EXISTS public."ChargeAndTax"
	(
	    id integer NOT NULL DEFAULT nextval('"ChargeAndTax_id_seq"'::regclass),
	    name text COLLATE pg_catalog."default" NOT NULL,
	    type text COLLATE pg_catalog."default" NOT NULL,
	    "valueType" text COLLATE pg_catalog."default" NOT NULL,
	    value double precision NOT NULL,
	    "isEditable" boolean NOT NULL DEFAULT true,
	    CONSTRAINT "ChargeAndTax_pkey" PRIMARY KEY (id)
	)

	TABLESPACE pg_default;

	ALTER TABLE IF EXISTS public."ChargeAndTax"
	    OWNER to postgres;

	CREATE TABLE IF NOT EXISTS public."Client"
	(
	    id integer NOT NULL DEFAULT nextval('"Client_id_seq"'::regclass),
	    name text COLLATE pg_catalog."default" NOT NULL,
	    document text COLLATE pg_catalog."default" NOT NULL,
	    "contactInfo" text COLLATE pg_catalog."default",
	    address text COLLATE pg_catalog."default",
	    CONSTRAINT "Client_pkey" PRIMARY KEY (id)
	)

	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Client"
	    OWNER to postgres;
		
	CREATE UNIQUE INDEX IF NOT EXISTS "Client_document_key"
	    ON public."Client" USING btree
	    (document COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	    TABLESPACE pg_default;

	CREATE TABLE IF NOT EXISTS public."Prestadora"
	(
	    id integer NOT NULL DEFAULT nextval('"Prestadora_id_seq"'::regclass),
	    name text COLLATE pg_catalog."default" NOT NULL,
	    location text COLLATE pg_catalog."default",
	    category text COLLATE pg_catalog."default",
	    "providerId" integer NOT NULL,
	    code text COLLATE pg_catalog."default",
	    type text COLLATE pg_catalog."default",
	    CONSTRAINT "Prestadora_pkey" PRIMARY KEY (id),
	    CONSTRAINT "Prestadora_providerId_fkey" FOREIGN KEY ("providerId")
	        REFERENCES public."Provider" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE RESTRICT
	)

	TABLESPACE pg_default;

	ALTER TABLE IF EXISTS public."Prestadora"
	    OWNER to postgres;

	CREATE TABLE IF NOT EXISTS public."Implant"
	(
	    id integer NOT NULL DEFAULT nextval('"Implant_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default" NOT NULL,
	    name text COLLATE pg_catalog."default" NOT NULL,
	    "branchId" integer,
	    CONSTRAINT "Implant_pkey" PRIMARY KEY (id),
	    CONSTRAINT "Implant_branchId_fkey" FOREIGN KEY ("branchId")
	        REFERENCES public."Branch" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL
	)

	TABLESPACE pg_default;

	ALTER TABLE IF EXISTS public."Implant"
    	OWNER to postgres;

	CREATE UNIQUE INDEX IF NOT EXISTS "Implant_code_key"
	    ON public."Implant" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	    TABLESPACE pg_default;

	CREATE TABLE IF NOT EXISTS public."MasterVariable"
	(
	    id integer NOT NULL DEFAULT nextval('"MasterVariable_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default" NOT NULL,
	    name text COLLATE pg_catalog."default" NOT NULL,
	    CONSTRAINT "MasterVariable_pkey" PRIMARY KEY (id)
	)

	TABLESPACE pg_default;

	ALTER TABLE IF EXISTS public."MasterVariable"
	    OWNER to postgres;
	
	CREATE UNIQUE INDEX IF NOT EXISTS "MasterVariable_code_key"
	    ON public."MasterVariable" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	    TABLESPACE pg_default;

	CREATE TABLE IF NOT EXISTS public."Product"
	(
	    id integer NOT NULL DEFAULT nextval('"Product_id_seq"'::regclass),
	    type text COLLATE pg_catalog."default" NOT NULL,
	    description text COLLATE pg_catalog."default" NOT NULL,
	    "basePrice" double precision NOT NULL,
	    "billingConcept" text COLLATE pg_catalog."default",
	    "serviceType" text COLLATE pg_catalog."default",
	    CONSTRAINT "Product_pkey" PRIMARY KEY (id)
	)

	TABLESPACE pg_default;

	ALTER TABLE IF EXISTS public."Product"
    	OWNER to postgres;

	CREATE TABLE IF NOT EXISTS public."Provider"
	(
	    id integer NOT NULL DEFAULT nextval('"Provider_id_seq"'::regclass),
	    name text COLLATE pg_catalog."default" NOT NULL,
	    "contactInfo" text COLLATE pg_catalog."default",
	    "commissionConfig" jsonb,
	    CONSTRAINT "Provider_pkey" PRIMARY KEY (id)
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Provider"
	    OWNER to postgres;
	
	CREATE TABLE IF NOT EXISTS public."Seller"
	(
	    id integer NOT NULL DEFAULT nextval('"Seller_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default",
	    name text COLLATE pg_catalog."default" NOT NULL,
	    email text COLLATE pg_catalog."default",
	    CONSTRAINT "Seller_pkey" PRIMARY KEY (id)
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Seller"
	    OWNER to postgres;
	
	CREATE UNIQUE INDEX IF NOT EXISTS "Seller_code_key"
	    ON public."Seller" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	    TABLESPACE pg_default;


	CREATE TABLE IF NOT EXISTS public."TicketPrinter"
	(
	    id integer NOT NULL DEFAULT nextval('"TicketPrinter_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default",
	    name text COLLATE pg_catalog."default" NOT NULL,
	    email text COLLATE pg_catalog."default",
	    CONSTRAINT "TicketPrinter_pkey" PRIMARY KEY (id)
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."TicketPrinter"
	    OWNER to postgres;
	
	CREATE UNIQUE INDEX IF NOT EXISTS "TicketPrinter_code_key"
	    ON public."TicketPrinter" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	    TABLESPACE pg_default;	

	CREATE TABLE IF NOT EXISTS public."Quotation"
	(
	    id integer NOT NULL DEFAULT nextval('"Quotation_id_seq"'::regclass),
	    "internalNumber" text COLLATE pg_catalog."default" NOT NULL,
	    date timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	    "clientId" integer NOT NULL,
	    currency text COLLATE pg_catalog."default" NOT NULL,
	    "exchangeRate" double precision NOT NULL,
	    "branchId" integer NOT NULL,
	    "implantId" integer,
	    "sellerId" integer,
	    "ticketPrinterId" integer,
	    "baseCommissionable" double precision NOT NULL,
	    "commissionPercentage" double precision NOT NULL,
	    "chargesAndTaxes" double precision NOT NULL,
	    "totalAmount" double precision NOT NULL,
	    CONSTRAINT "Quotation_pkey" PRIMARY KEY (id),
	    CONSTRAINT "Quotation_branchId_fkey" FOREIGN KEY ("branchId")
	        REFERENCES public."Branch" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE RESTRICT,
	    CONSTRAINT "Quotation_clientId_fkey" FOREIGN KEY ("clientId")
	        REFERENCES public."Client" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE RESTRICT,
	    CONSTRAINT "Quotation_implantId_fkey" FOREIGN KEY ("implantId")
	        REFERENCES public."Implant" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL,
	    CONSTRAINT "Quotation_sellerId_fkey" FOREIGN KEY ("sellerId")
	        REFERENCES public."Seller" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL,
	    CONSTRAINT "Quotation_ticketPrinterId_fkey" FOREIGN KEY ("ticketPrinterId")
	        REFERENCES public."TicketPrinter" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL
	)

	TABLESPACE pg_default;

	ALTER TABLE IF EXISTS public."Quotation"
	    OWNER to postgres;


	CREATE UNIQUE INDEX IF NOT EXISTS "Quotation_internalNumber_key"
	    ON public."Quotation" USING btree
	    ("internalNumber" COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	    TABLESPACE pg_default;

	CREATE TABLE IF NOT EXISTS public."QuotationProduct"
	(
	    id integer NOT NULL DEFAULT nextval('"QuotationProduct_id_seq"'::regclass),
	    "quotationId" integer NOT NULL,
	    "productId" integer NOT NULL,
	    quantity integer NOT NULL,
	    price double precision NOT NULL,
	    "providerId" integer,
	    "prestadoraId" integer,
	    "checkInDate" timestamp(3) without time zone,
	    "checkOutDate" timestamp(3) without time zone,
	    nights integer,
	    "paxAdults" integer,
	    "paxChildren" integer,
	    "serviceType" text COLLATE pg_catalog."default",
	    destination text COLLATE pg_catalog."default",
	    "reservationCode" text COLLATE pg_catalog."default",
	    "sellerCommission" double precision,
	    "ticketPrinterCommission" double precision,
	    "comboId" integer,
	    "mainTaxId" integer,
	    "inNationality" integer DEFAULT 1,
	    CONSTRAINT "QuotationProduct_pkey" PRIMARY KEY (id),
	    CONSTRAINT "QuotationProduct_prestadoraId_fkey" FOREIGN KEY ("prestadoraId")
	        REFERENCES public."Prestadora" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL,
	    CONSTRAINT "QuotationProduct_productId_fkey" FOREIGN KEY ("productId")
	        REFERENCES public."Product" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE CASCADE,
	    CONSTRAINT "QuotationProduct_providerId_fkey" FOREIGN KEY ("providerId")
	        REFERENCES public."Provider" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL,
	    CONSTRAINT "QuotationProduct_quotationId_fkey" FOREIGN KEY ("quotationId")
	        REFERENCES public."Quotation" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE CASCADE
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."QuotationProduct"
	    OWNER to postgres;

	CREATE TABLE IF NOT EXISTS public."QuotationProductPassenger"
	(
	    id integer NOT NULL DEFAULT nextval('"QuotationProductPassenger_id_seq"'::regclass),
	    "quotationProductId" integer NOT NULL,
	    name text COLLATE pg_catalog."default" NOT NULL,
	    document text COLLATE pg_catalog."default" NOT NULL,
	    CONSTRAINT "QuotationProductPassenger_pkey" PRIMARY KEY (id),
	    CONSTRAINT "QuotationProductPassenger_quotationProductId_fkey" FOREIGN KEY ("quotationProductId")
	        REFERENCES public."QuotationProduct" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE CASCADE
	)

	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."QuotationProductPassenger"
	    OWNER to postgres;

	CREATE TABLE IF NOT EXISTS public."QuotationProductTax"
	(
	    id integer NOT NULL DEFAULT nextval('"QuotationProductTax_id_seq"'::regclass),
	    "quotationProductId" integer NOT NULL,
	    "chargeAndTaxId" integer NOT NULL,
	    "valueSnapshot" double precision NOT NULL,
	    "valueTypeSnapshot" text COLLATE pg_catalog."default" NOT NULL,
	    "explicitAmount" double precision,
	    CONSTRAINT "QuotationProductTax_pkey" PRIMARY KEY (id),
	    CONSTRAINT "QuotationProductTax_chargeAndTaxId_fkey" FOREIGN KEY ("chargeAndTaxId")
	        REFERENCES public."ChargeAndTax" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE RESTRICT,
	    CONSTRAINT "QuotationProductTax_quotationProductId_fkey" FOREIGN KEY ("quotationProductId")
	        REFERENCES public."QuotationProduct" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE CASCADE
	)

	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."QuotationProductTax"
	    OWNER to postgres;	

	CREATE TABLE IF NOT EXISTS public."QuotationProductVariable"
	(
	    id integer NOT NULL DEFAULT nextval('"QuotationProductVariable_id_seq"'::regclass),
	    "quotationProductId" integer NOT NULL,
	    "masterVariableId" integer NOT NULL,
	    value text COLLATE pg_catalog."default" NOT NULL,
	    CONSTRAINT "QuotationProductVariable_pkey" PRIMARY KEY (id),
	    CONSTRAINT "QuotationProductVariable_masterVariableId_fkey" FOREIGN KEY ("masterVariableId")
	        REFERENCES public."MasterVariable" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE RESTRICT,
	    CONSTRAINT "QuotationProductVariable_quotationProductId_fkey" FOREIGN KEY ("quotationProductId")
	        REFERENCES public."QuotationProduct" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE CASCADE
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."QuotationProductVariable"
	    OWNER to postgres;	

	CREATE TABLE IF NOT EXISTS public."Role"
	(
	    id integer NOT NULL DEFAULT nextval('"Role_id_seq"'::regclass),
	    name text COLLATE pg_catalog."default" NOT NULL,
	    CONSTRAINT "Role_pkey" PRIMARY KEY (id)
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Role"
	    OWNER to postgres;
	
	CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key"
	    ON public."Role" USING btree
	    (name COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	    TABLESPACE pg_default;	
	

	CREATE TABLE IF NOT EXISTS public."User"
	(
	    id integer NOT NULL DEFAULT nextval('"User_id_seq"'::regclass),
	    name text COLLATE pg_catalog."default" NOT NULL,
	    email text COLLATE pg_catalog."default" NOT NULL,
	    "passwordHash" text COLLATE pg_catalog."default" NOT NULL,
	    "resetPasswordToken" text COLLATE pg_catalog."default",
	    "resetPasswordExpires" timestamp(3) without time zone,
	    "roleId" integer NOT NULL,
	    "branchId" integer,
	    "implantId" integer,
	    "ticketPrinterId" integer,
	    CONSTRAINT "User_pkey" PRIMARY KEY (id),
	    CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId")
	        REFERENCES public."Branch" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL,
	    CONSTRAINT "User_implantId_fkey" FOREIGN KEY ("implantId")
	        REFERENCES public."Implant" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL,
	    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId")
	        REFERENCES public."Role" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE RESTRICT,
	    CONSTRAINT "User_ticketPrinterId_fkey" FOREIGN KEY ("ticketPrinterId")
	        REFERENCES public."TicketPrinter" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."User"
	    OWNER to postgres;
	-- Index: User_email_key
	
	-- DROP INDEX IF EXISTS public."User_email_key";
	
	CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"
	    ON public."User" USING btree
	    (email COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	    TABLESPACE pg_default;
	
	CREATE UNIQUE INDEX IF NOT EXISTS "User_resetPasswordToken_key"
	    ON public."User" USING btree
	    ("resetPasswordToken" COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	    TABLESPACE pg_default;	

	CREATE TABLE IF NOT EXISTS public."SystemLog"
	(
	    id integer NOT NULL DEFAULT nextval('"SystemLog_id_seq"'::regclass),
	    "userId" integer,
	    action text COLLATE pg_catalog."default" NOT NULL,
	    module text COLLATE pg_catalog."default" NOT NULL,
	    description text COLLATE pg_catalog."default" NOT NULL,
	    metadata jsonb,
	    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	    CONSTRAINT "SystemLog_pkey" PRIMARY KEY (id),
	    CONSTRAINT "SystemLog_userId_fkey" FOREIGN KEY ("userId")
	        REFERENCES public."User" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."SystemLog"
	    OWNER to postgres;
		
	
END	$$ 		