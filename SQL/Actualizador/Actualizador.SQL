-- ==========================================================
-- ARCHIVO ACTUALIZADOR COMPLETO: TABLAS + FUNCIONES + SPS
-- Generado Automáticamente
-- ==========================================================

-- >>> 1. CREACIÓN DE TABLAS E ÍNDICES (TABLEINI) <<<

--do $$
--BEGIN
	CREATE SEQUENCE IF NOT EXISTS public."Attachment_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."Attachment_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."Branch_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
		
	ALTER SEQUENCE public."Branch_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."ChargeAndTax_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
		
	ALTER SEQUENCE public."ChargeAndTax_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."Client_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."Client_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."Combo_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."Combo_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."Currency_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."Currency_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."ComboProduct_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
		
	ALTER SEQUENCE public."ComboProduct_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."ComboProductTax_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."ComboProductTax_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."Hotel_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."Hotel_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."Implant_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."Implant_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."MasterVariable_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;

	
	ALTER SEQUENCE public."MasterVariable_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."Product_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."Product_id_seq"
	    OWNER TO postgres;	

	CREATE SEQUENCE IF NOT EXISTS public."Provider_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."Provider_id_seq"
	    OWNER TO postgres;	

	CREATE SEQUENCE IF NOT EXISTS public."QuotationCombo_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."QuotationCombo_id_seq"
	    OWNER TO postgres;	

	CREATE SEQUENCE IF NOT EXISTS public."QuotationProductPassenger_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."QuotationProductPassenger_id_seq"
	    OWNER TO postgres;	

	CREATE SEQUENCE IF NOT EXISTS public."QuotationProductTax_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."QuotationProductTax_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."QuotationProductVariable_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."QuotationProductVariable_id_seq"
	    OWNER TO postgres;	

	CREATE SEQUENCE IF NOT EXISTS public."QuotationProduct_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."QuotationProduct_id_seq"
	    OWNER TO postgres;	

	CREATE SEQUENCE IF NOT EXISTS public."Quotation_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."Quotation_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."Role_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."Role_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."Seller_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."Seller_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."SystemLog_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."SystemLog_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."SystemParameter_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."SystemParameter_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."TicketPrinter_id_seq"
	    INCREMENT 1
	    START 1
	    MINVALUE 1
	    MAXVALUE 2147483647
	    CACHE 1;
	
	ALTER SEQUENCE public."TicketPrinter_id_seq"
		OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."User_id_seq"
		INCREMENT 1
		START 1
		MINVALUE 1
		MAXVALUE 2147483647
		CACHE 1;
	
	ALTER SEQUENCE public."User_id_seq"
	    OWNER TO postgres;	
		
	CREATE TABLE IF NOT EXISTS public."Role"
	(
	    id integer NOT NULL DEFAULT nextval('"Role_id_seq"'::regclass),
	    name text COLLATE pg_catalog."default" NOT NULL,
	    CONSTRAINT "Role_pkey" PRIMARY KEY (id)
	)

	TABLESPACE pg_default;

	ALTER TABLE IF EXISTS public."Role"
	    OWNER to postgres;
	-- Index: Role_name_key
	
	-- DROP INDEX IF EXISTS public."Role_name_key";

	CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key"
	    ON public."Role" USING btree
	    (name COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
    
	TABLESPACE pg_default;

	ALTER SEQUENCE public."Role_id_seq"
	    OWNED BY public."Role".id;

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

	ALTER SEQUENCE public."Branch_id_seq"
	    OWNED BY public."Branch".id;

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
	-- Index: Implant_code_key
	
	-- DROP INDEX IF EXISTS public."Implant_code_key";

	CREATE UNIQUE INDEX IF NOT EXISTS "Implant_code_key"
	    ON public."Implant" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
    
	TABLESPACE pg_default;

	ALTER SEQUENCE public."Implant_id_seq"
	    OWNED BY public."Implant".id;


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

	ALTER SEQUENCE public."ChargeAndTax_id_seq"
	    OWNED BY public."ChargeAndTax".id;

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

	ALTER SEQUENCE public."TicketPrinter_id_seq"
	    OWNED BY public."TicketPrinter".id;
	
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

	ALTER SEQUENCE public."User_id_seq"
	    OWNED BY public."User".id;
	

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

	ALTER SEQUENCE public."Branch_id_seq"
	    OWNED BY public."Branch".id;	

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

	ALTER SEQUENCE public."Client_id_seq"
	    OWNED BY public."Client".id;


	CREATE TABLE IF NOT EXISTS public."Provider"
	(
	    id integer NOT NULL DEFAULT nextval('"Provider_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default",
	    name text COLLATE pg_catalog."default" NOT NULL,
	    "contactInfo" text COLLATE pg_catalog."default",
	    "commissionConfig" jsonb,
	    CONSTRAINT "Provider_pkey" PRIMARY KEY (id)
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Provider"
	    OWNER to postgres;

	CREATE UNIQUE INDEX IF NOT EXISTS "Provider_code_key"
	    ON public."Provider" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	    
	TABLESPACE pg_default;	

	ALTER SEQUENCE public."Provider_id_seq"
	    OWNED BY public."Provider".id;
		

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
	
	ALTER SEQUENCE public."MasterVariable_id_seq"
	    OWNED BY public."MasterVariable".id;

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

	ALTER SEQUENCE public."Seller_id_seq"
	    OWNED BY public."Seller".id;
	    
	
	CREATE TABLE IF NOT EXISTS public."Prestadora"
	(
	    id integer NOT NULL DEFAULT nextval('"Hotel_id_seq"'::regclass),
	    name text COLLATE pg_catalog."default" NOT NULL,
	    location text COLLATE pg_catalog."default",
	    category text COLLATE pg_catalog."default",
	    "providerId" integer,
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

	CREATE UNIQUE INDEX IF NOT EXISTS "Hotel_code_key"
	    ON public."Prestadora" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
    
	TABLESPACE pg_default;

	ALTER SEQUENCE public."Hotel_id_seq"
	    OWNED BY public."Prestadora".id;

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

	ALTER SEQUENCE public."SystemLog_id_seq"
	    OWNED BY public."SystemLog".id;	

	CREATE TABLE IF NOT EXISTS public."SystemParameter"
	(
	    id integer NOT NULL DEFAULT nextval('"SystemParameter_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default" NOT NULL,
	    name text COLLATE pg_catalog."default" NOT NULL,
	    value text COLLATE pg_catalog."default" NOT NULL,
	    CONSTRAINT "SystemParameter_pkey" PRIMARY KEY (id)
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."SystemParameter"
	    OWNER to postgres;


	CREATE UNIQUE INDEX IF NOT EXISTS "SystemParameter_code_key"
	    ON public."SystemParameter" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
    
	TABLESPACE pg_default;	

	ALTER SEQUENCE public."SystemParameter_id_seq"
	    OWNED BY public."SystemParameter".id;	

	CREATE TABLE IF NOT EXISTS public."Product"
	(
	    id integer NOT NULL DEFAULT nextval('"Product_id_seq"'::regclass),
	    type text COLLATE pg_catalog."default" NOT NULL,
	    description text COLLATE pg_catalog."default" NOT NULL,
	    "basePrice" double precision NOT NULL,
	    cost double precision DEFAULT 0,
	    "billingConcept" text COLLATE pg_catalog."default",
	    "serviceType" text COLLATE pg_catalog."default",
	    code text COLLATE pg_catalog."default",
	    CONSTRAINT "Product_pkey" PRIMARY KEY (id)
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Product"
	    OWNER to postgres;
	-- Index: Product_code_key
	
	-- DROP INDEX IF EXISTS public."Product_code_key";
	
	CREATE UNIQUE INDEX IF NOT EXISTS "Product_code_key"
	    ON public."Product" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	TABLESPACE pg_default;	

	ALTER SEQUENCE public."Product_id_seq"
	    OWNED BY public."Product".id;	

	CREATE TABLE IF NOT EXISTS public."Currency"
	(
	    id integer NOT NULL DEFAULT nextval('"Currency_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default" NOT NULL,
	    name text COLLATE pg_catalog."default" NOT NULL,
	    "exchangeRate" double precision NOT NULL,
	    CONSTRAINT "Currency_pkey" PRIMARY KEY (id)
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Currency"
	    OWNER to postgres;

	CREATE UNIQUE INDEX IF NOT EXISTS "Currency_code_key"
	    ON public."Currency" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	TABLESPACE pg_default;

	ALTER SEQUENCE public."Currency_id_seq"
	    OWNED BY public."Currency".id;

	CREATE TABLE IF NOT EXISTS public."Combo"
	(
	    id integer NOT NULL DEFAULT nextval('"Combo_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default" NOT NULL,
	    name text COLLATE pg_catalog."default" NOT NULL,
	    cupos integer DEFAULT 0,
	    "currencyId" integer,
	    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	    "updatedAt" timestamp without time zone DEFAULT now(),
	    CONSTRAINT "Combo_pkey" PRIMARY KEY (id),
	    CONSTRAINT "Combo_currencyId_fkey" FOREIGN KEY ("currencyId")
	        REFERENCES public."Currency" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Combo"
	    OWNER to postgres;
	-- Index: Combo_code_key

 	--DROP INDEX IF EXISTS public."Combo_code_key";

	CREATE UNIQUE INDEX IF NOT EXISTS "Combo_code_key"
		ON public."Combo" USING btree
		(code COLLATE pg_catalog."default" ASC NULLS LAST)
		WITH (fillfactor=100, deduplicate_items=True)
	
	TABLESPACE pg_default;

	ALTER SEQUENCE public."Combo_id_seq"
	    OWNED BY public."Combo".id;		

	CREATE TABLE IF NOT EXISTS public."ComboProduct"
	(
	    id integer NOT NULL DEFAULT nextval('"ComboProduct_id_seq"'::regclass),
	    "comboId" integer NOT NULL,
	    "productId" integer NOT NULL,
	    price double precision NOT NULL,
	    cost double precision DEFAULT 0,
	    "checkInDate" timestamp(3) without time zone,
	    "checkOutDate" timestamp(3) without time zone,
	    "prestadoraId" integer,
	    "mainTaxId" integer,
	    "paxAdults" integer,
	    "paxChildren" integer,
	    "providerId" integer,
	    "inNationality" integer DEFAULT 1,
	    quantity integer NOT NULL DEFAULT 1,
	    CONSTRAINT "ComboProduct_pkey" PRIMARY KEY (id),
	    CONSTRAINT "ComboProduct_comboId_fkey" FOREIGN KEY ("comboId")
	        REFERENCES public."Combo" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE CASCADE,
	    CONSTRAINT "ComboProduct_prestadoraId_fkey" FOREIGN KEY ("prestadoraId")
	        REFERENCES public."Prestadora" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL,
	    CONSTRAINT "ComboProduct_productId_fkey" FOREIGN KEY ("productId")
	        REFERENCES public."Product" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE RESTRICT,
	    CONSTRAINT "ComboProduct_providerId_fkey" FOREIGN KEY ("providerId")
	        REFERENCES public."Provider" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."ComboProduct"
	    OWNER to postgres;

	ALTER SEQUENCE public."ComboProduct_id_seq"
	    OWNED BY public."ComboProduct".id;		

	CREATE TABLE IF NOT EXISTS public."ComboProductTax"
	(
	    id integer NOT NULL DEFAULT nextval('"ComboProductTax_id_seq"'::regclass),
	    "comboProductId" integer NOT NULL,
	    "chargeAndTaxId" integer NOT NULL,
	    amount double precision NOT NULL,
	    "isMain" boolean NOT NULL DEFAULT false,
	    CONSTRAINT "ComboProductTax_pkey" PRIMARY KEY (id),
	    CONSTRAINT "ComboProductTax_chargeAndTaxId_fkey" FOREIGN KEY ("chargeAndTaxId")
	        REFERENCES public."ChargeAndTax" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE RESTRICT,
	    CONSTRAINT "ComboProductTax_comboProductId_fkey" FOREIGN KEY ("comboProductId")
	        REFERENCES public."ComboProduct" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE CASCADE
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."ComboProductTax"
	    OWNER to postgres;

	ALTER SEQUENCE public."ComboProductTax_id_seq"
	    OWNED BY public."ComboProductTax".id;		

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
	    "userId" integer,
	    "state" varchar(25) DEFAULT 'Nuevo',
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
	        ON DELETE SET NULL,
	    CONSTRAINT "Quotation_userId_fkey" FOREIGN KEY ("userId")
	        REFERENCES public."User" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE SET NULL
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Quotation"
	    OWNER to postgres;
	-- Index: Quotation_internalNumber_key
	
	-- DROP INDEX IF EXISTS public."Quotation_internalNumber_key";
	
	CREATE UNIQUE INDEX IF NOT EXISTS "Quotation_internalNumber_key"
	    ON public."Quotation" USING btree
	    ("internalNumber" COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	TABLESPACE pg_default;	

	ALTER SEQUENCE public."Quotation_id_seq"
	    OWNED BY public."Quotation".id;
	
	CREATE TABLE IF NOT EXISTS public."QuotationCombo"
	(
	    id integer NOT NULL DEFAULT nextval('"QuotationCombo_id_seq"'::regclass),
	    "quotationId" integer NOT NULL,
	    "comboId" integer NOT NULL,
	    CONSTRAINT "QuotationCombo_pkey" PRIMARY KEY (id),
	    CONSTRAINT "QuotationCombo_comboId_fkey" FOREIGN KEY ("comboId")
	        REFERENCES public."Combo" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE RESTRICT,
	    CONSTRAINT "QuotationCombo_quotationId_fkey" FOREIGN KEY ("quotationId")
	        REFERENCES public."Quotation" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE CASCADE
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."QuotationCombo"
	    OWNER to postgres;

	ALTER SEQUENCE public."QuotationCombo_id_seq"
	    OWNED BY public."QuotationCombo".id;	

	CREATE TABLE IF NOT EXISTS public."QuotationProduct"
	(
	    id integer NOT NULL DEFAULT nextval('"QuotationProduct_id_seq"'::regclass),
	    "quotationId" integer NOT NULL,
	    "productId" integer NOT NULL,
	    quantity integer NOT NULL,
	    price double precision NOT NULL,
	    cost double precision DEFAULT 0,
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

	ALTER SEQUENCE public."QuotationProduct_id_seq"
	    OWNED BY public."QuotationProduct".id;	
	
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

	ALTER SEQUENCE public."QuotationProductPassenger_id_seq"
	    OWNED BY public."QuotationProductPassenger".id;	

	CREATE TABLE IF NOT EXISTS public."QuotationProductTax"
	(
	    id integer NOT NULL DEFAULT nextval('"QuotationProductTax_id_seq"'::regclass),
	    "quotationProductId" integer NOT NULL,
	    "chargeAndTaxId" integer NOT NULL,
	    "valueSnapshot" double precision NOT NULL,
	    "valueTypeSnapshot" text COLLATE pg_catalog."default" NOT NULL,
	    "explicitAmount" double precision,
	    "isMain" boolean NOT NULL DEFAULT false,
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

	ALTER SEQUENCE public."QuotationProductTax_id_seq"
	    OWNED BY public."QuotationProductTax".id;		

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

	ALTER SEQUENCE public."QuotationProductVariable_id_seq"
	    OWNED BY public."QuotationProductVariable".id;

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

	ALTER SEQUENCE public."Attachment_id_seq"
	    OWNED BY public."Attachment".id;

	ALTER TABLE public."ChargeAndTax" ADD COLUMN IF NOT EXISTS "isEditable" boolean NOT NULL DEFAULT true;
	ALTER TABLE public."ComboProduct" ADD COLUMN IF NOT EXISTS "inNationality" integer DEFAULT 1;
	ALTER TABLE public."QuotationProduct" ADD COLUMN IF NOT EXISTS "inNationality" integer DEFAULT 1;
	ALTER TABLE public."QuotationProductTax" ADD COLUMN IF NOT EXISTS "explicitAmount" double precision;
	ALTER TABLE public."QuotationProductTax" ADD COLUMN IF NOT EXISTS "isMain" boolean NOT NULL DEFAULT false;
	ALTER TABLE public."ComboProductTax" ADD COLUMN IF NOT EXISTS "isMain" boolean NOT NULL DEFAULT false;	
	--ALTER TABLE public."ComboProduct" RENAME COLUMN "hotelId" TO "prestadoraId";
	--ALTER TABLE public."QuotationProduct" RENAME COLUMN "hotelId" TO "prestadoraId";
	ALTER TABLE public."ChargeAndTax" ADD COLUMN IF NOT EXISTS "code" text;
	ALTER TABLE public."ChargeAndTax" DROP CONSTRAINT IF EXISTS "ChargeAndTax_code_key";
	ALTER TABLE public."ChargeAndTax" ADD CONSTRAINT "ChargeAndTax_code_key" UNIQUE ("code");
	-- Columnas de costo en productos
	ALTER TABLE public."Product" ADD COLUMN IF NOT EXISTS "cost" double precision DEFAULT 0;
	ALTER TABLE public."ComboProduct" ADD COLUMN IF NOT EXISTS "cost" double precision DEFAULT 0;
	ALTER TABLE public."QuotationProduct" ADD COLUMN IF NOT EXISTS "cost" double precision DEFAULT 0;
	-- Tabla Currency ya incluida en la creación arriba, pero por si la BD es existente:
	CREATE TABLE IF NOT EXISTS public."Currency"
	(
	    id integer NOT NULL DEFAULT nextval('"Currency_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default" NOT NULL,
	    name text COLLATE pg_catalog."default" NOT NULL,
	    "exchangeRate" double precision NOT NULL,
	    CONSTRAINT "Currency_pkey" PRIMARY KEY (id)
	) TABLESPACE pg_default;
	ALTER TABLE IF EXISTS public."Currency" OWNER to postgres;
	CREATE UNIQUE INDEX IF NOT EXISTS "Currency_code_key"
	    ON public."Currency" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	TABLESPACE pg_default;
	-- Columna currencyId en Combo para BDs existentes
	ALTER TABLE public."Combo" ADD COLUMN IF NOT EXISTS "currencyId" integer;
	ALTER TABLE public."Combo" DROP CONSTRAINT IF EXISTS "Combo_currencyId_fkey";
	ALTER TABLE public."Combo" ADD CONSTRAINT "Combo_currencyId_fkey"
	    FOREIGN KEY ("currencyId") REFERENCES public."Currency"(id)
	    ON UPDATE CASCADE ON DELETE SET NULL;
		
	-- Columna state en Quotation
	ALTER TABLE public."Quotation" ADD COLUMN IF NOT EXISTS "state" varchar(25) DEFAULT 'Nuevo';
--END	$$ 		

-- >>> 2. FUNCIONES <<<

-- Archivo: fnClienteListar.sql
CREATE OR REPLACE FUNCTION public.fnClienteListar()
RETURNS SETOF public."Client"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."Client" ORDER BY name ASC;
END;
$$;


-- Archivo: fnComboListar.sql
CREATE OR REPLACE FUNCTION public.fnComboListar()
RETURNS SETOF JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'id', c.id,
            'code', c.code,
            'name', c.name,
            'cupos', c."cupos",
            'currencyId', c."currencyId",
            'createdAt', c."createdAt",
            'products', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', cp.id,
                        'productId', cp."productId",
                        'product', jsonb_build_object('id', p.id, 'code', p.code, 'description', p.description),
                        'quantity', cp.quantity,
                        'price', cp.price,
                        'cost', COALESCE(cp."cost", 0),
                        'providerId', cp."providerId",
                        'prestadoraId', cp."prestadoraId",
                        'checkInDate', cp."checkInDate",
                        'checkOutDate', cp."checkOutDate",
                        'paxAdults', cp."paxAdults",
                        'paxChildren', cp."paxChildren",
                        'mainTaxId', cp."mainTaxId",
                        'inNationality', COALESCE(cp."inNationality", 1),
                        'appliedTaxes', (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', cpt.id,
                                    'chargeAndTaxId', cpt."chargeAndTaxId",
                                    'amount', cpt.amount,
                                    'isMain', cpt."isMain",
                                    'chargeAndTax', (
                                        SELECT jsonb_build_object('id', ct.id, 'name', ct.name, 'value', ct.value, 'valueType', ct."valueType")
                                        FROM public."ChargeAndTax" ct WHERE ct.id = cpt."chargeAndTaxId"
                                    )
                                )
                            )
                            FROM public."ComboProductTax" cpt
                            WHERE cpt."comboProductId" = cp.id
                        )
                    )
                )
                FROM public."ComboProduct" cp
                JOIN public."Product" p ON cp."productId" = p.id
                WHERE cp."comboId" = c.id
            ), '[]'::jsonb)
        )
    FROM public."Combo" c
    ORDER BY c."createdAt" DESC;
END;
$$;


-- Archivo: fnCotizacionHistorial.sql
CREATE OR REPLACE FUNCTION public.fnCotizacionHistorial()
RETURNS SETOF JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'id', q.id,
            'internalNumber', q."internalNumber",
            'clientName', COALESCE(c.name, 'Cliente desconocido'),
            'providerName', COALESCE((
                SELECT prov.name 
                FROM public."QuotationProduct" qp
                JOIN public."Provider" prov ON qp."providerId" = prov.id
                WHERE qp."quotationId" = q.id
                LIMIT 1
            ), 'Proveedor Desconocido'),
            'createdAt', q.date,
            'totalAmount', q."totalAmount",
            'currency', q.currency,
            'userName', COALESCE(u.name, 'Sistema'),
            'state', COALESCE(q.state, 'NUEVO'),
            'nights', COALESCE((
                SELECT qp.nights 
                FROM public."QuotationProduct" qp
                WHERE qp."quotationId" = q.id
                LIMIT 1
            ), 1)
        )
    FROM public."Quotation" q
    JOIN public."Client" c ON q."clientId" = c.id
    LEFT JOIN public."User" u ON q."userId" = u.id
    ORDER BY q.date DESC;
END;
$$;


-- Archivo: fnCotizacionListar.sql
CREATE OR REPLACE FUNCTION public.fnCotizacionListar()
RETURNS SETOF JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'id', q.id,
            'internalNumber', q."internalNumber",
            'date', q.date,
            'clientId', q."clientId",
            'currency', q.currency,
            'exchangeRate', q."exchangeRate",
            'totalAmount', q."totalAmount",
            'client', jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'document', c.document
            ),
            'products', COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', qp.id,
                            'productId', qp."productId",
                            'product', jsonb_build_object(
                                'id', p.id,
                                'description', p.description
                            ),
                            'provider', CASE WHEN prov.id IS NOT NULL THEN jsonb_build_object('id', prov.id, 'name', prov.name) ELSE NULL END,
                            'prestadora', CASE WHEN h.id IS NOT NULL THEN jsonb_build_object('id', h.id, 'name', h.name) ELSE NULL END,
                            'quantity', qp.quantity,
                            'price', qp.price,
                            'checkInDate', qp."checkInDate",
                            'checkOutDate', qp."checkOutDate",
                            'inNationality', COALESCE(qp."inNationality", 1),
                            'mainTaxId', qp."mainTaxId",
                            'passengers', COALESCE((
                                SELECT jsonb_agg(jsonb_build_object('id', qpax.id, 'name', qpax.name, 'document', qpax.document))
                                FROM public."QuotationProductPassenger" qpax
                                WHERE qpax."quotationProductId" = qp.id
                            ), '[]'::jsonb),
                            'variables', COALESCE((
                                SELECT jsonb_agg(jsonb_build_object('id', qvar.id, 'masterVariableId', qvar."masterVariableId", 'value', qvar.value))
                                FROM public."QuotationProductVariable" qvar
                                WHERE qvar."quotationProductId" = qp.id
                            ), '[]'::jsonb),
                            'appliedTaxes', COALESCE((
                                SELECT jsonb_agg(jsonb_build_object('chargeAndTaxId', qpt."chargeAndTaxId", 'explicitAmount', qpt."explicitAmount", 'isMain', qpt."isMain"))
                                FROM public."QuotationProductTax" qpt
                                WHERE qpt."quotationProductId" = qp.id
                            ), '[]'::jsonb)
                        )
                    )
                    FROM public."QuotationProduct" qp
                    LEFT JOIN public."Product" p ON qp."productId" = p.id
                    LEFT JOIN public."Provider" prov ON qp."providerId" = prov.id
                    LEFT JOIN public."Prestadora" h ON qp."prestadoraId" = h.id
                    WHERE qp."quotationId" = q.id
                ),
                '[]'::jsonb
            )
        )
    FROM public."Quotation" q
    JOIN public."Client" c ON q."clientId" = c.id
    ORDER BY q.date DESC;
END;
$$;


-- Archivo: fnGetSQLServerConfig.sql
CREATE OR REPLACE FUNCTION "fnGetSQLServerConfig"()
RETURNS TABLE (
    servidor TEXT,
    usuario TEXT,
    clave TEXT,
    base_datos TEXT,
    puerto TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT value FROM "SystemParameter" WHERE code = 'ServidorSQLServer') as servidor,
        (SELECT value FROM "SystemParameter" WHERE code = 'UsuarioSQLServer') as usuario,
        (SELECT value FROM "SystemParameter" WHERE code = 'ClaveSQLServer') as clave,
        (SELECT value FROM "SystemParameter" WHERE code = 'BaseSQLServer') as base_datos,
        (SELECT value FROM "SystemParameter" WHERE code = 'PuertoSQLServer') as puerto;
END;
$$ LANGUAGE plpgsql;


-- Archivo: fnImpuestoListar.sql
CREATE OR REPLACE FUNCTION public.fnImpuestoListar()
RETURNS SETOF public."ChargeAndTax"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."ChargeAndTax" ORDER BY name ASC;
END;
$$;


-- Archivo: fnMonedaListar.sql
CREATE OR REPLACE FUNCTION public.fnMonedaListar(
    p_id INT DEFAULT NULL   -- NULL = todas las monedas, valor = una moneda específica
)
RETURNS TABLE (
    id             INT,
    code           TEXT,
    name           TEXT,
    "exchangeRate" FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.code,
        c.name,
        c."exchangeRate"
    FROM public."Currency" c
    WHERE
        p_id IS NULL
        OR c.id = p_id
    ORDER BY c.code;
END;
$$;


-- Archivo: fnPrestadoraListar.sql
CREATE OR REPLACE FUNCTION public.fnPrestadoraListar()
RETURNS SETOF JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'id', h.id,
            'code', h.code,
            'name', h.name,
            'category', h.category,
            'type', h.type,
            'location', h.location,
            'providerId', h."providerId",
            'provider', (
                SELECT jsonb_build_object('id', p.id, 'name', p.name)
                FROM public."Provider" p WHERE p.id = h."providerId"
            )
        )
    FROM public."Prestadora" h
    ORDER BY h.name ASC;
END;
$$;


-- Archivo: fnProductoListar.sql
CREATE OR REPLACE FUNCTION public.fnProductoListar()
RETURNS SETOF public."Product"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."Product" ORDER BY id DESC;
END;
$$;


-- Archivo: fnProveedorListar.sql
CREATE OR REPLACE FUNCTION public.fnProveedorListar()
RETURNS SETOF JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'id', p.id,
            'code', p.code,
            'name', p.name,
            'contactInfo', p."contactInfo",
            'commissionConfig', p."commissionConfig",
            'prestadoras', COALESCE((
                SELECT jsonb_agg(h)
                FROM public."Prestadora" h
                WHERE h."providerId" = p.id
            ), '[]'::jsonb)
        )
    FROM public."Provider" p
    ORDER BY p.name ASC;
END;
$$;


-- >>> 3. PROCEDIMIENTOS ALMACENADOS (SP) <<<

-- Archivo: spClienteActualizar.sql
CREATE OR REPLACE PROCEDURE public.spClienteActualizar(
    p_id INT,
    p_name TEXT,
    p_document TEXT,
    p_contact_info TEXT,
    p_address TEXT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public."Client" WHERE document = p_document AND id <> p_id) THEN
        p_mensaje_resultado := 'ERROR: El documento ya está registrado por otro cliente.';
        RETURN;
    END IF;

    UPDATE public."Client" SET
        "name" = p_name,
        "document" = p_document,
        "contactInfo" = p_contact_info,
        "address" = p_address
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Cliente ' || p_id || ' actualizado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
        ROLLBACK;
END;
$$;


-- Archivo: spClienteCrear.sql
CREATE OR REPLACE PROCEDURE public.spClienteCrear(
    p_name TEXT,
    p_document TEXT,
    p_contact_info TEXT,
    p_address TEXT,
    p_acting_user_id INT,
    INOUT p_client_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public."Client" WHERE document = p_document) THEN
        p_mensaje_resultado := 'ERROR: El documento ya está registrado';
        RETURN;
    END IF;

    INSERT INTO public."Client" ("name", "document", "contactInfo", "address")
    VALUES (p_name, p_document, p_contact_info, p_address)
    RETURNING id INTO p_client_id;

    p_mensaje_resultado := 'SUCCESS: Cliente creado con ID ' || p_client_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spClienteEliminar.sql
CREATE OR REPLACE PROCEDURE public.spClienteEliminar(
    p_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public."Client" WHERE id = p_id;
    p_mensaje_resultado := 'SUCCESS: Cliente eliminado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
        ROLLBACK;
END;
$$;


-- Archivo: spComboActualizar.sql
CREATE OR REPLACE PROCEDURE public.spComboActualizar(
    p_id INT,
    p_code TEXT,
    p_name TEXT,
    p_cupos INT,
    p_currency_id INT,
    p_products JSONB,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
    DECLARE
        v_item RECORD;
        v_tax RECORD;
        v_combo_product_id INT;
        v_local_combo_id INT := p_id;
    BEGIN
        IF v_local_combo_id IS NULL THEN
            p_mensaje_resultado := 'ERROR: p_id is NULL (backend error).';
            RETURN;
        END IF;

        -- Actualizar datos básicos
        UPDATE public."Combo" SET "code" = p_code, "name" = p_name, "cupos" = COALESCE(p_cupos, 0), "currencyId" = p_currency_id, "updatedAt"=CURRENT_TIMESTAMP WHERE id = v_local_combo_id;

        -- Limpiar productos previos
        DELETE FROM public."ComboProductTax" WHERE "comboProductId" IN (SELECT id FROM public."ComboProduct" WHERE "comboId" = v_local_combo_id);
        DELETE FROM public."ComboProduct" WHERE "comboId" = v_local_combo_id;

        -- Insertar productos nuevos
        IF p_products IS NOT NULL AND jsonb_array_length(p_products) > 0 THEN
            FOR v_item IN SELECT * FROM jsonb_to_recordset(p_products) AS x(
                "productId" INT, quantity INT, price FLOAT, cost FLOAT, "providerId" INT, "prestadoraId" INT, 
                "checkInDate" TIMESTAMP, "checkOutDate" TIMESTAMP,
                "paxAdults" INT, "paxChildren" INT, "mainTaxId" INT, "appliedTaxes" JSONB, "inNationality" INT
            )
            LOOP
                IF v_item."productId" IS NOT NULL THEN
                    INSERT INTO public."ComboProduct" (
                        "comboId", "productId", "quantity", "price", "cost", "providerId", "prestadoraId", 
                        "checkInDate", "checkOutDate",
                        "paxAdults", "paxChildren", "mainTaxId", "inNationality"
                    ) VALUES (
                        v_local_combo_id, v_item."productId", COALESCE(v_item.quantity, 1), COALESCE(v_item.price, 0), v_item.cost, v_item."providerId", v_item."prestadoraId",
                        v_item."checkInDate", v_item."checkOutDate",
                        v_item."paxAdults", v_item."paxChildren", v_item."mainTaxId", COALESCE(v_item."inNationality", 1)
                    ) RETURNING id INTO v_combo_product_id;

                    -- Insertar impuestos del producto si existen
                    IF v_item."appliedTaxes" IS NOT NULL THEN
                        FOR v_tax IN SELECT * FROM jsonb_to_recordset(v_item."appliedTaxes") AS t("chargeAndTaxId" INT, amount FLOAT, "isMain" BOOLEAN)
                        LOOP
                            INSERT INTO public."ComboProductTax" ("comboProductId", "chargeAndTaxId", "amount", "isMain")
                            VALUES (v_combo_product_id, v_tax."chargeAndTaxId", v_tax.amount, COALESCE(v_tax."isMain", FALSE));
                        END LOOP;
                    END IF;
                END IF;
            END LOOP;
        END IF;

        p_mensaje_resultado := 'SUCCESS: Combo ' || v_local_combo_id || ' actualizado correctamente.';
    EXCEPTION WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
    END;
$$;


-- Archivo: spComboCrear.sql
CREATE OR REPLACE PROCEDURE public.spComboCrear(
    p_code TEXT,
    p_name TEXT,
    p_cupos INT,
    p_currency_id INT,
    p_products JSONB,
    p_acting_user_id INT,
    INOUT p_combo_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
    DECLARE
        v_item RECORD;
        v_tax RECORD;
        v_combo_product_id INT;
        v_inserted_combo_id INT;
    BEGIN
        -- Insertar el combo principal
        INSERT INTO public."Combo" ("code", "name", "cupos", "currencyId", "createdAt","updatedAt")
        VALUES (p_code, p_name, COALESCE(p_cupos, 0), p_currency_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id INTO v_inserted_combo_id;

        IF v_inserted_combo_id IS NULL THEN
            p_mensaje_resultado := 'ERROR: No se pudo generar el ID del Combo.';
            RETURN;
        END IF;

        -- Insertar productos del combo
        IF p_products IS NOT NULL AND jsonb_array_length(p_products) > 0 THEN
            FOR v_item IN SELECT * FROM jsonb_to_recordset(p_products) AS x(
                "productId" INT, quantity INT, price FLOAT, cost FLOAT, "providerId" INT, "prestadoraId" INT, 
                "checkInDate" TIMESTAMP, "checkOutDate" TIMESTAMP,
                "paxAdults" INT, "paxChildren" INT, "mainTaxId" INT, "appliedTaxes" JSONB, "inNationality" INT
            )
            LOOP
                -- Solo insertar si hay un producto válido
                IF v_item."productId" IS NOT NULL THEN
                    INSERT INTO public."ComboProduct" (
                        "comboId", "productId", "quantity", "price", "cost", "providerId", "prestadoraId", 
                        "checkInDate", "checkOutDate",
                        "paxAdults", "paxChildren", "mainTaxId", "inNationality"
                    ) VALUES (
                        v_inserted_combo_id, v_item."productId", COALESCE(v_item.quantity, 1), COALESCE(v_item.price, 0), v_item.cost, v_item."providerId", v_item."prestadoraId",
                        v_item."checkInDate", v_item."checkOutDate",
                        v_item."paxAdults", v_item."paxChildren", v_item."mainTaxId", COALESCE(v_item."inNationality", 1)
                    ) RETURNING id INTO v_combo_product_id;

                    -- Insertar impuestos asociados si existen
                    IF v_item."appliedTaxes" IS NOT NULL THEN
                        FOR v_tax IN SELECT * FROM jsonb_to_recordset(v_item."appliedTaxes") AS t("chargeAndTaxId" INT, amount FLOAT, "isMain" BOOLEAN)
                        LOOP
                            INSERT INTO public."ComboProductTax" ("comboProductId", "chargeAndTaxId", "amount", "isMain")
                            VALUES (v_combo_product_id, v_tax."chargeAndTaxId", v_tax.amount, COALESCE(v_tax."isMain", FALSE));
                        END LOOP;
                    END IF;
                END IF;
            END LOOP;
        END IF;

        p_combo_id := v_inserted_combo_id;
        p_mensaje_resultado := 'SUCCESS: Combo creado correctamente con ID ' || v_inserted_combo_id;

    EXCEPTION WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
    END;
$$;


-- Archivo: spComboEliminar.sql
CREATE OR REPLACE PROCEDURE public.spComboEliminar(
    p_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public."Combo" WHERE id = p_id;
    p_mensaje_resultado := 'SUCCESS: Combo eliminado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
        ROLLBACK;
END;
$$;


-- Archivo: spCotizacionActualizar.sql
CREATE OR REPLACE PROCEDURE public.spCotizacionActualizar(
    p_id INT,
    p_data JSONB,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_item RECORD;
    v_tax RECORD;
    v_pax RECORD;
    v_var RECORD;
    v_combo RECORD;
    v_quotation_product_id INT;
BEGIN
    -- Validaciones
    IF NOT EXISTS (SELECT 1 FROM public."Quotation" WHERE id = p_id) THEN
        p_mensaje_resultado := 'ERROR: La cotización con ID ' || p_id || ' no existe.';
        RETURN;
    END IF;

    IF NULLIF(p_data->>'clientId', '') IS NULL THEN
        p_mensaje_resultado := 'ERROR: El campo Cliente es obligatorio.';
        RETURN;
    END IF;

    IF p_data->'items' IS NULL OR jsonb_array_length(p_data->'items') = 0 THEN
        p_mensaje_resultado := 'ERROR: La cotización debe tener al menos un producto.';
        RETURN;
    END IF;

    IF EXISTS (
        SELECT 1 FROM jsonb_to_recordset(p_data->'items') AS x("productId" INT, "mainTaxId" TEXT)
        WHERE "productId" IS NULL OR NULLIF("mainTaxId", '') IS NULL
    ) THEN
        p_mensaje_resultado := 'ERROR: Todos los productos deben tener un producto y un Cargo Principal seleccionado.';
        RETURN;
    END IF;

    UPDATE public."Quotation" SET
        "clientId" = NULLIF(p_data->>'clientId', '')::INT,
        "currency" = p_data->>'currency',
        "exchangeRate" = NULLIF(p_data->>'exchangeRate', '')::FLOAT,
        "branchId" = NULLIF(p_data->>'branchId', '')::INT,
        "implantId" = NULLIF(p_data->>'implantId', '')::INT,
        "sellerId" = NULLIF(p_data->>'sellerId', '')::INT,
        "ticketPrinterId" = NULLIF(p_data->>'ticketPrinterId', '')::INT,
        "commissionPercentage" = NULLIF(p_data->>'commissionPercentage', '')::FLOAT,
        "chargesAndTaxes" = NULLIF(p_data->>'chargesAndTaxes', '')::FLOAT,
        "totalAmount" = NULLIF(p_data->>'totalAmount', '')::FLOAT,
        "state" = COALESCE(p_data->>'state', 'Nuevo'),
        "date" = CURRENT_TIMESTAMP
    WHERE id = p_id;

    DELETE FROM public."QuotationCombo" WHERE "quotationId" = p_id;
    FOR v_combo IN SELECT * FROM jsonb_to_recordset(p_data->'combos') AS x("comboId" INT, "id" INT)
    LOOP
        INSERT INTO public."QuotationCombo" ("quotationId", "comboId")
        VALUES (p_id, COALESCE(v_combo."comboId", v_combo.id));
    END LOOP;

    DELETE FROM public."QuotationProduct" WHERE "quotationId" = p_id;
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_data->'items') AS x(
                      "productId" INT, quantity INT, price FLOAT, cost FLOAT, "providerId" TEXT, "prestadoraId" TEXT,
                      "checkIn" TEXT, "checkOut" TEXT, "nights" INT, "mainTaxId" TEXT,
                      "paxAdults" INT, "paxChildren" INT, "serviceType" TEXT, "destination" TEXT,
                      "reservationCode" TEXT, "sellerCommission" FLOAT, "ticketPrinterCommission" FLOAT,
                      "comboId" TEXT, "appliedTaxes" JSONB, "passengers" JSONB, "variables" JSONB, "inNationality" INT
                  )
    LOOP
        INSERT INTO public."QuotationProduct" (
            "quotationId", "productId", "quantity", "price", "cost", "providerId", "prestadoraId",
            "checkInDate", "checkOutDate", "nights", "paxAdults", "paxChildren",
            "serviceType", "destination", "reservationCode", "sellerCommission", 
            "ticketPrinterCommission", "comboId", "mainTaxId", "inNationality"
        ) VALUES (
            p_id, v_item."productId", v_item.quantity, v_item.price, v_item.cost, NULLIF(v_item."providerId", '')::INT, NULLIF(v_item."prestadoraId", '')::INT,
            CASE WHEN v_item."checkIn" IS NOT NULL AND v_item."checkIn" <> '' THEN v_item."checkIn"::TIMESTAMP ELSE NULL END,
            CASE WHEN v_item."checkOut" IS NOT NULL AND v_item."checkOut" <> '' THEN v_item."checkOut"::TIMESTAMP ELSE NULL END,
            v_item.nights, v_item."paxAdults", v_item."paxChildren",
            v_item."serviceType", v_item."destination", v_item."reservationCode", v_item."sellerCommission",
            v_item."ticketPrinterCommission", NULLIF(v_item."comboId", '')::INT, NULLIF(v_item."mainTaxId", '')::INT, COALESCE(v_item."inNationality", 1)
        ) RETURNING id INTO v_quotation_product_id;

        IF v_item.passengers IS NOT NULL THEN
            FOR v_pax IN SELECT * FROM jsonb_to_recordset(v_item.passengers) AS x(name TEXT, document TEXT)
            LOOP
                INSERT INTO public."QuotationProductPassenger" ("quotationProductId", "name", "document")
                VALUES (v_quotation_product_id, v_pax.name, v_pax.document);
            END LOOP;
        END IF;

        IF v_item."appliedTaxes" IS NOT NULL THEN
            FOR v_tax IN SELECT * FROM jsonb_to_recordset(v_item."appliedTaxes") AS x("chargeAndTaxId" INT, "explicitAmount" FLOAT)
            LOOP
                INSERT INTO public."QuotationProductTax" (
                    "quotationProductId", "chargeAndTaxId", "valueSnapshot", "valueTypeSnapshot", "explicitAmount", "isMain"
                )
                SELECT v_quotation_product_id, ct.id, ct.value, ct."valueType", v_tax."explicitAmount", 
                       CASE WHEN NULLIF(v_item."mainTaxId", '')::INT = ct.id THEN TRUE ELSE FALSE END
                FROM public."ChargeAndTax" ct
                WHERE ct.id = v_tax."chargeAndTaxId";
            END LOOP;
        END IF;

        IF v_item.variables IS NOT NULL THEN
            FOR v_var IN SELECT * FROM jsonb_to_recordset(v_item.variables) AS x("masterVariableId" INT, value TEXT)
            LOOP
                INSERT INTO public."QuotationProductVariable" ("quotationProductId", "masterVariableId", "value")
                VALUES (v_quotation_product_id, v_var."masterVariableId", v_var.value);
            END LOOP;
        END IF;
    END LOOP;

    -- Calcular y actualizar el totalAmount basado en QuotationProductTax
    UPDATE public."Quotation"
    SET "totalAmount" = COALESCE("chargesAndTaxes", 0) + (
        SELECT COALESCE(SUM(qpt."explicitAmount"), 0)
        FROM public."QuotationProductTax" qpt
        JOIN public."QuotationProduct" qp ON qpt."quotationProductId" = qp.id
        WHERE qp."quotationId" = p_id
    )
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Cotización ' || p_id || ' actualizada correctamente.';

    -- Registrar en Auditoría
    CALL public."spLogRegistrar"(
        p_acting_user_id, 
        'QUOTATION', 
        'UPDATE', 
        'Se actualizó la cotización con ID ' || p_id, 
        p_data, 
        v_quotation_product_id -- Reutilizamos variable para el logId temporal
    );

EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spCotizacionCrear.sql
CREATE OR REPLACE PROCEDURE public.spCotizacionCrear(
    p_data JSONB,
    p_acting_user_id INT,
    INOUT p_quotation_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_internal_number TEXT;
    v_quotation_id INT;
    v_item RECORD;
    v_tax RECORD;
    v_pax RECORD;
    v_var RECORD;
    v_combo RECORD;
    v_quotation_product_id INT;
BEGIN
    -- Validaciones
    IF NULLIF(p_data->>'clientId', '') IS NULL THEN
        p_mensaje_resultado := 'ERROR: El campo Cliente es obligatorio.';
        RETURN;
    END IF;

    IF p_data->'items' IS NULL OR jsonb_array_length(p_data->'items') = 0 THEN
        p_mensaje_resultado := 'ERROR: La cotización debe tener al menos un producto.';
        RETURN;
    END IF;

    IF EXISTS (
        SELECT 1 FROM jsonb_to_recordset(p_data->'items') AS x("productId" INT, "mainTaxId" TEXT)
        WHERE "productId" IS NULL OR NULLIF("mainTaxId", '') IS NULL
    ) THEN
        p_mensaje_resultado := 'ERROR: Todos los productos deben tener un producto y un Cargo Principal seleccionado.';
        RETURN;
    END IF;

    v_internal_number := 'QUO-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || floor(random() * 1000)::text;

    INSERT INTO public."Quotation" (
        "internalNumber", "date", "clientId", "currency", "exchangeRate", 
        "branchId", "implantId", "sellerId", "ticketPrinterId", 
        "baseCommissionable", "commissionPercentage", "chargesAndTaxes", 
        "totalAmount", "userId", "state"
    ) VALUES (
        v_internal_number, CURRENT_TIMESTAMP, NULLIF(p_data->>'clientId', '')::INT, p_data->>'currency', NULLIF(p_data->>'exchangeRate', '')::FLOAT,
        NULLIF(p_data->>'branchId', '')::INT, NULLIF(p_data->>'implantId', '')::INT, NULLIF(p_data->>'sellerId', '')::INT, NULLIF(p_data->>'ticketPrinterId', '')::INT,
        0, NULLIF(p_data->>'commissionPercentage', '')::FLOAT, NULLIF(p_data->>'chargesAndTaxes', '')::FLOAT,
        NULLIF(p_data->>'totalAmount', '')::FLOAT, p_acting_user_id, 'Nuevo'
    ) RETURNING id INTO v_quotation_id;

    FOR v_combo IN SELECT * FROM jsonb_to_recordset(p_data->'combos') AS x("comboId" INT, "id" INT)
    LOOP
        DECLARE
            v_combo_real_id INT := COALESCE(v_combo."comboId", v_combo.id);
            v_cupos_disponibles INT;
            v_combo_name TEXT;
        BEGIN
            SELECT "cupos", "name" INTO v_cupos_disponibles, v_combo_name
            FROM public."Combo" WHERE id = v_combo_real_id;

            IF v_cupos_disponibles IS NOT NULL AND v_cupos_disponibles <= 0 THEN
                p_mensaje_resultado := 'ERROR: El combo "' || COALESCE(v_combo_name, v_combo_real_id::TEXT) || '" no tiene cupos disponibles.';
                RETURN;
            END IF;

            INSERT INTO public."QuotationCombo" ("quotationId", "comboId")
            VALUES (v_quotation_id, v_combo_real_id);

            -- Descontar 1 cupo
            UPDATE public."Combo" SET "cupos" = "cupos" - 1 WHERE id = v_combo_real_id;
        END;
    END LOOP;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_data->'items') AS x(
                      "productId" INT, quantity INT, price FLOAT, cost FLOAT, "providerId" TEXT, "prestadoraId" TEXT,
                      "checkIn" TEXT, "checkOut" TEXT, "nights" INT, "mainTaxId" TEXT,
                      "paxAdults" INT, "paxChildren" INT, "serviceType" TEXT, "destination" TEXT,
                      "reservationCode" TEXT, "sellerCommission" FLOAT, "ticketPrinterCommission" FLOAT,
                      "comboId" TEXT, "appliedTaxes" JSONB, "passengers" JSONB, "variables" JSONB, "inNationality" INT
                  )
    LOOP
        INSERT INTO public."QuotationProduct" (
            "quotationId", "productId", "quantity", "price", "cost", "providerId", "prestadoraId",
            "checkInDate", "checkOutDate", "nights", "paxAdults", "paxChildren",
            "serviceType", "destination", "reservationCode", "sellerCommission", 
            "ticketPrinterCommission", "comboId", "mainTaxId", "inNationality"
        ) VALUES (
            v_quotation_id, v_item."productId", v_item.quantity, v_item.price, v_item.cost, NULLIF(v_item."providerId", '')::INT, NULLIF(v_item."prestadoraId", '')::INT,
            CASE WHEN v_item."checkIn" IS NOT NULL AND v_item."checkIn" <> '' THEN v_item."checkIn"::TIMESTAMP ELSE NULL END,
            CASE WHEN v_item."checkOut" IS NOT NULL AND v_item."checkOut" <> '' THEN v_item."checkOut"::TIMESTAMP ELSE NULL END,
            v_item.nights, v_item."paxAdults", v_item."paxChildren",
            v_item."serviceType", v_item."destination", v_item."reservationCode", v_item."sellerCommission",
            v_item."ticketPrinterCommission", NULLIF(v_item."comboId", '')::INT, NULLIF(v_item."mainTaxId", '')::INT, COALESCE(v_item."inNationality", 1)
        ) RETURNING id INTO v_quotation_product_id;

        IF v_item.passengers IS NOT NULL THEN
            FOR v_pax IN SELECT * FROM jsonb_to_recordset(v_item.passengers) AS x(name TEXT, document TEXT)
            LOOP
                INSERT INTO public."QuotationProductPassenger" ("quotationProductId", "name", "document")
                VALUES (v_quotation_product_id, v_pax.name, v_pax.document);
            END LOOP;
        END IF;

        IF v_item."appliedTaxes" IS NOT NULL THEN
            FOR v_tax IN SELECT * FROM jsonb_to_recordset(v_item."appliedTaxes") AS x("chargeAndTaxId" INT, "explicitAmount" FLOAT)
            LOOP
                INSERT INTO public."QuotationProductTax" (
                    "quotationProductId", "chargeAndTaxId", "valueSnapshot", "valueTypeSnapshot", "explicitAmount", "isMain"
                )
                SELECT v_quotation_product_id, ct.id, ct.value, ct."valueType", v_tax."explicitAmount", 
                       CASE WHEN NULLIF(v_item."mainTaxId", '')::INT = ct.id THEN TRUE ELSE FALSE END
                FROM public."ChargeAndTax" ct
                WHERE ct.id = v_tax."chargeAndTaxId";
            END LOOP;
        END IF;

        IF v_item.variables IS NOT NULL THEN
            FOR v_var IN SELECT * FROM jsonb_to_recordset(v_item.variables) AS x("masterVariableId" INT, value TEXT)
            LOOP
                INSERT INTO public."QuotationProductVariable" ("quotationProductId", "masterVariableId", "value")
                VALUES (v_quotation_product_id, v_var."masterVariableId", v_var.value);
            END LOOP;
        END IF;
    END LOOP;

    -- Calcular y actualizar el totalAmount basado en QuotationProductTax
    UPDATE public."Quotation"
    SET "totalAmount" = COALESCE("chargesAndTaxes", 0) + (
        SELECT COALESCE(SUM(qpt."explicitAmount"), 0)
        FROM public."QuotationProductTax" qpt
        JOIN public."QuotationProduct" qp ON qpt."quotationProductId" = qp.id
        WHERE qp."quotationId" = v_quotation_id
    )
    WHERE id = v_quotation_id;

    p_quotation_id := v_quotation_id;
    p_mensaje_resultado := 'SUCCESS: Cotización creada correctamente con ID ' || v_quotation_id;

    -- Registrar en Auditoría
    CALL public."spLogRegistrar"(
        p_acting_user_id, 
        'QUOTATION', 
        'CREATE', 
        'Se creó la cotización ' || v_internal_number || ' (ID: ' || v_quotation_id || ')', 
        p_data, 
        v_quotation_id -- Reutilizamos variable para el logId temporal
    );

EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spCotizacionEliminar.sql
CREATE OR REPLACE PROCEDURE public.spCotizacionEliminar(
    p_quotation_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
    v_internal_number TEXT;
BEGIN
    SELECT "internalNumber" INTO v_internal_number FROM public."Quotation" WHERE id = p_quotation_id;
    IF NOT FOUND THEN
        p_mensaje_resultado := 'ERROR: Cotización no encontrada con ID ' || p_quotation_id;
        RETURN;
    END IF;

    DELETE FROM public."Quotation" WHERE id = p_quotation_id;
    p_mensaje_resultado := 'SUCCESS: Cotización ' || v_internal_number || ' eliminada con éxito.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spExportQuotation.sql
CREATE OR REPLACE PROCEDURE public.spExportQuotation(
    Quotation_id TEXT,
	User_id INT,
	INOUT mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
/*
    AUTOR: Rubiel Gelis Guzman
    DESCRIPCIÓN: Generación de XML poblando TODAS las columnas de las tablas temporales con nombres explícitos en los SELECT.
*/
DECLARE
    v_xml TEXT;
    v_nombre_usuario TEXT;
	v_state   TEXT;
    v_msg     TEXT;
    v_context TEXT;
    v_line    TEXT;
BEGIN
    -- 1. Inicializar
    mensaje_resultado := '';

    Quotation_id := TRIM(BOTH ',' FROM TRIM(COALESCE(Quotation_id, '')));
    IF Quotation_id = '' THEN
        mensaje_resultado := 'ERROR: No se han proporcionado IDs de cotización válidos.';
        RETURN;
    END IF;

    -- 2. Validación de usuario
    SELECT "name" INTO v_nombre_usuario FROM public."User" WHERE id = User_id;
    IF NOT FOUND THEN
        mensaje_resultado := 'ERROR: El usuario ' || User_id || ' no existe.';
        RETURN;
    END IF;

    -- 3. Crear Tablas Temporales (ESQUEMA COMPLETO)
    CREATE TEMP TABLE IF NOT EXISTS Cotizacion (
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_sucursal VARCHAR(25),
		cd_implante VARCHAR(25),
		cd_consecutivo VARCHAR(25),
		cd_usuario VARCHAR(25),
		dt_fechacont TIMESTAMP ,
		dt_fecha TIMESTAMP ,
		cd_usuarioAct VARCHAR(25),
		dt_fechaAct TIMESTAMP ,
		cd_tercero_codigo VARCHAR(25) ,
		ds_tercero_nombre VARCHAR(250) ,
		cd_cliente_codigo VARCHAR(25) ,
		ds_cliente_nombre VARCHAR(250) ,
		ds_cliente_dir VARCHAR(250) ,
		ds_cliente_ciudad VARCHAR(40) ,
		ds_cliente_tel VARCHAR(25) ,
		ds_cliente_dirdesp VARCHAR(250) ,
		ds_cliente_email VARCHAR(60) ,
		ds_cliente_contacto VARCHAR(40) ,
		ds_cliente_contacto_email VARCHAR(60) ,
		cd_monedas_IATA VARCHAR(25),
		cd_vendedor CHAR(25) ,
		cd_tiqueteador VARCHAR(25) ,
		bn_anexo BYTEA ,
		am_tcambio DECIMAL ,
		am_tcambiousd DECIMAL ,
		cd_cencosto CHAR(16) ,
		ds_observacion VARCHAR(8000) ,
		ds_Campo_libre1 VARCHAR(500) ,
		ds_Campo_libre2 VARCHAR(500) ,
		cd_tipoventa VARCHAR(25),
		in_estado INT ,
		dt_vence TIMESTAMP ,
		cd_Etapa VARCHAR(25),
		ds_seguimiento_etapa VARCHAR(500) ,
		bl_ManejaOpciones BIT(1) DEFAULT B'0',
		in_NumeroOpciones INT ,
		bl_CerrarCotizacion BIT(1) DEFAULT B'0',
		in_OpcionSeleccionada INT ,
		bl_grupos BIT(1) DEFAULT B'0',
		gk_sabre VARCHAR(25) ,
		cd_Especialista VARCHAR(25),
		cd_TipoFormaPagoProveedor VARCHAR(25),
		cd_MedioReservacion VARCHAR(25),
		bl_bloqueada BIT(1) DEFAULT B'0',
		cd_usuario_Bloqueo VARCHAR(25),
		ds_AlertaSolicitud VARCHAR(8000) ,
		bl_comisiona BIT(1) DEFAULT B'0',
		ds_FormaDePago VARCHAR(250) ,
		ds_records VARCHAR(25) ,
		bl_entregadoCliente BIT(1) DEFAULT B'0',
		dt_entregadoCliente TIMESTAMP ,
		id_sys_entidades INT ,
		cd_MonedaPagoDestino VARCHAR(25) ,
		cd_FormaPagoDestino VARCHAR(25) ,
		ds_DocumentoPagoDestino VARCHAR(50) ,
		dt_CheckInPagoDestino TIMESTAMP ,
		dt_CheckOutPagoDestino TIMESTAMP ,
		bl_fechaPagoDestino BIT(1) DEFAULT B'0',
		ds_hotelTieneTiquete VARCHAR(2),
		ds_GDS VARCHAR(2),
		cd_Evento VARCHAR(25),
        orig_id_ref INT
    ) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS CotizacionServicios(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_TiposConceptFac VARCHAR(25),
		cd_ConceptoFacturacion VARCHAR(25),
		cd_TiposServicio VARCHAR(25) ,
		cd_Cotizacion VARCHAR(25) ,
		cd_fac_factura VARCHAR(25) ,
		cd_fac_remision VARCHAR(25) ,
		cd_proveedores VARCHAR(25) ,
		ds_tiposervnm VARCHAR(50) ,
		cd_prov_hotel CHAR(10) ,
		cd_prov_car CHAR(10) ,
		cd_prov_air CHAR(10) ,
		ds_destino VARCHAR(30) ,
		ds_servicio VARCHAR(250) ,
		ds_descrip VARCHAR(4000) ,
		ds_paxname VARCHAR(20) ,
		ds_paxape VARCHAR(20) ,
		cd_paxtype CHAR(25) ,
		in_nacionalidad INT ,
		cd_voucher VARCHAR(20) ,
		in_cantpax INT ,
		dt_llegada TIMESTAMP ,
		dt_salida TIMESTAMP ,
		cd_cencosto VARCHAR(16) ,
		cd_auxiliar VARCHAR(16) ,
		cd_item VARCHAR(16) ,
		am_valorprov DECIMAL ,
		cd_monedaprov VARCHAR(25) ,
		ds_InfoAdicional VARCHAR(8000) ,
		cd_carrental VARCHAR(25) ,
		cd_hoteles VARCHAR(25) ,
		bl_anulado BIT(1) DEFAULT B'0' ,
		cd_tiquete CHAR(11) ,
		cd_fuente_anul CHAR(2) ,
		cd_serie_anul CHAR(2) ,
		cd_consecutivo_anul CHAR(8) ,
		cd_usuario_anul VARCHAR(25),
		cd_sucursal_anul VARCHAR(25) ,
		cd_implante_anul VARCHAR(25) ,
		am_basecomisionable DECIMAL ,
		am_porcomision NUMERIC(8, 4) ,
		cd_voucherPrefijo VARCHAR(25) ,
		bl_notdomicilionacional BIT(1) DEFAULT B'0' ,
		Valor_Comision DECIMAL ,
		Valor_Recaudo DECIMAL ,
		dias_recaudo INT ,
		ds_paxClasificacion CHAR(7) ,
		cd_tipoplan VARCHAR(25) ,
		cd_acomodacion VARCHAR(25) ,
		in_dias INT ,
		in_noches INT ,
		ds_records VARCHAR(25) ,
		cd_GrConcepto VARCHAR(25) ,
		in_diasSrv INT ,
		in_nochesSrv INT ,
		cd_Especialista VARCHAR(25),
		am_porcentaje_descuento NUMERIC(8, 4) ,
		am_valor_descuento DECIMAL ,
		ds_motivo_descuento VARCHAR(1000) ,
		cd_cargosdesc_descuento VARCHAR(25) ,
		in_NumeroOpcion INT ,
		dt_FechaSalidaSrv TIMESTAMP ,
		dt_FechaLlegadaSrv TIMESTAMP ,
		cd_localizador VARCHAR(25) ,
		cd_voucherpax VARCHAR(25) ,
		am_basecomisionableprov DECIMAL ,
		am_porcomisionprov NUMERIC(8, 4) ,
		cd_NumeFac VARCHAR(15) ,
		dt_VenceFac TIMESTAMP ,
		cd_AcomodacionSrv VARCHAR(25) ,
		cd_TipoPlanSrv VARCHAR(25) ,
		in_habitaciones INT ,
		in_habitacionesSrv INT ,
		cd_Consecutivo_VARiablesAdicionales VARCHAR(8) ,
		cd_confirmacion VARCHAR(25) ,
		ds_confirmadopor VARCHAR(250) ,
		cd_paxidentificacion VARCHAR(25) ,
		bl_politicaCancelacion BIT(1) DEFAULT B'0' ,
		dt_politicaCancelacion TIMESTAMP ,
		cd_tipoHabitacionacion VARCHAR(25) ,
		cd_fac_facturaComision VARCHAR(25) ,
		cd_fac_remisionComision VARCHAR(25) ,
		cd_TarjetaAsistencia VARCHAR(25) ,
		cd_Regiones VARCHAR(25) ,
		Iden_GDS INT ,
		id_sys_entidades INT ,
		ds_TipoAuto VARCHAR(50) ,
		ds_Origen VARCHAR(30) ,
		ds_DirOrigen VARCHAR(250) ,
		ds_DirDestino VARCHAR(250) ,
		ds_TipoTarifa VARCHAR(50) ,
		am_ValorUSD DECIMAL ,
		ds_NoVuelo VARCHAR(25) ,
		ds_Vehiculo VARCHAR(250) ,
		ds_Placa VARCHAR(25) ,
		ds_CategoriaVehiculo VARCHAR(250) ,
		ds_NombreConductor VARCHAR(50) ,
		ds_telefono VARCHAR(25) ,
		ds_IdiomaConductor VARCHAR(25) ,
		cd_MonedaSrv VARCHAR(25) ,
		cd_TipoServicio VARCHAR(25) ,
		cd_Aerolinea VARCHAR(25) ,
		in_EdadPax INT ,
		am_PorFacParcial NUMERIC(8, 4) ,
		ds_GDS VARCHAR(25) ,
		dt_fechaficheroBBVA TIMESTAMP ,
		bl_tiquete BIT(1) DEFAULT B'0' ,
		am_basedescuento DECIMAL ,
		am_pordescuento NUMERIC(18, 4) ,
		cd_CotizacionServicios_Depende VARCHAR(25),
        orig_id_ref INT,
		orig_id_quotationref INT,
		mainTaxId INT
	) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS CotizacionServicios_PaxAdicional(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_Cotizacion VARCHAR(25),
		cd_CotizacionServicios VARCHAR(25),
		ds_paxape VARCHAR(30),
		ds_paxname VARCHAR(30),
		ds_paxprefix CHAR(25),
		ds_paxClasificacion CHAR(25),
		cd_voucherpax VARCHAR(25),
		cd_paxidentificacion VARCHAR(25),
		in_edad INT,
		cd_tiquete CHAR(50)
	) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS CotizacionServicios_VariableAdicional(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_Cotizacion VARCHAR(25),
		cd_CotizacionServicios VARCHAR(25),
		ds_maestro VARCHAR(25), 
		ds_VariableAdicional VARCHAR(25),
		ds_valor VARCHAR(500),
		cd_codigo CHAR(25)
	) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS CotizacionCargos(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_CotizacionServicios VARCHAR(25) ,
		cd_CotizacionCargos VARCHAR(25),
		cd_cargosdesc VARCHAR(25) ,
		ds_cargonm VARCHAR(50) ,
		bl_noshow BIT(1) DEFAULT B'0' ,
		am_contado DECIMAL ,
		am_credito DECIMAL ,
		am_valor DECIMAL GENERATED ALWAYS AS (am_contado + am_credito) STORED,
		am_contado_ME DECIMAL ,
		am_credito_ME DECIMAL ,
		am_valor_ME DECIMAL GENERATED ALWAYS AS (am_contado_ME + am_credito_ME) STORED,
        orig_id_ref INT,
		cd_Cotizacion VARCHAR(25) 
	) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS CotizacionImpuestos(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_CotizacionCargos VARCHAR(25),
		cd_CotizacionImpuestos VARCHAR(25),
		cd_ImpRet VARCHAR(25),
		ds_Impas VARCHAR(50),
		cd_impcta VARCHAR(16),
		am_porcentaje DECIMAL,
		bl_contabilizar BIT(1) DEFAULT B'0' ,
		am_contado DECIMAL,
		am_credito DECIMAL,
		am_valor DECIMAL GENERATED ALWAYS AS (am_contado + am_credito) STORED,
		am_contado_ME DECIMAL,
		am_credito_ME DECIMAL,
		am_valor_ME DECIMAL GENERATED ALWAYS AS (am_contado_ME + am_credito_ME) STORED,
		cd_CotizacionServicios VARCHAR(25),
		cd_Cotizacion VARCHAR(25)
	) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS Fac_Servicios_TiposFacturacionHoteles(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_Cotizacion varchar(25),
		cd_CotizacionServicios varchar(25),
		cd_TiposFacturacionHoteles varchar(25),
		cd_cargosdesc varchar(25),
		in_cantidad INT,
		am_contado DECIMAL,
		am_credito DECIMAL,
		am_valor DECIMAL GENERATED ALWAYS AS (am_contado + am_credito) STORED,
		ds_cargonm varchar(50) NULL
	) ON COMMIT DROP;

    -- 4. Poblar Tablas Temporales (POBLANDO TODAS LAS COLUMNAS CON NOMBRES EXPLÍCITOS)
    
    INSERT INTO Cotizacion (
        cd_sucursal, cd_implante, cd_consecutivo, cd_usuario, dt_fechacont, dt_fecha, 
        cd_usuarioAct, dt_fechaAct, cd_tercero_codigo, ds_tercero_nombre, cd_cliente_codigo, 
        ds_cliente_nombre, ds_cliente_dir, ds_cliente_ciudad, ds_cliente_tel, ds_cliente_dirdesp, 
        ds_cliente_email, ds_cliente_contacto, ds_cliente_contacto_email, cd_monedas_IATA, 
        cd_vendedor, cd_tiqueteador, bn_anexo, am_tcambio, am_tcambiousd, cd_cencosto, 
        ds_observacion, ds_Campo_libre1, ds_Campo_libre2, cd_tipoventa, in_estado, 
        dt_vence, cd_Etapa, ds_seguimiento_etapa, bl_ManejaOpciones, in_NumeroOpciones, 
        bl_CerrarCotizacion, in_OpcionSeleccionada, bl_grupos, gk_sabre, cd_Especialista, 
        cd_TipoFormaPagoProveedor, cd_MedioReservacion, bl_bloqueada, cd_usuario_Bloqueo, 
        ds_AlertaSolicitud, bl_comisiona, ds_FormaDePago, ds_records, bl_entregadoCliente, 
        dt_entregadoCliente, id_sys_entidades, cd_MonedaPagoDestino, cd_FormaPagoDestino, 
        ds_DocumentoPagoDestino, dt_CheckInPagoDestino, dt_CheckOutPagoDestino, 
        bl_fechaPagoDestino, ds_hotelTieneTiquete, ds_GDS, cd_Evento, orig_id_ref
    )
    SELECT 
        COALESCE(b.code, '') as cd_sucursal, 
        COALESCE(i.code, '') as cd_implante, 
        'Q' || LPAD(q."id"::text, 7, '0') as cd_consecutivo, 
        v_nombre_usuario as cd_usuario, 
        q.date as dt_fechacont, 
        q.date as dt_fecha,
        v_nombre_usuario as cd_usuarioAct, 
        q.date as dt_fechaAct, 
        COALESCE(c.document, '') as cd_tercero_codigo, 
        c.name as ds_tercero_nombre, 
        COALESCE(c.document, '') as cd_cliente_codigo,
        c.name as ds_cliente_nombre, 
        COALESCE(c.address, '') as ds_cliente_dir, 
        '' as ds_cliente_ciudad, 
        '' as ds_cliente_tel, 
        '' as ds_cliente_dirdesp, 
        COALESCE(u.email, '') as ds_cliente_email, 
        c.name as ds_cliente_contacto, 
        '' as ds_cliente_contacto_email, 
        q.currency as cd_monedas_IATA,
        COALESCE(s.code, '') as cd_vendedor, 
        COALESCE(t.code, '') as cd_tiqueteador, 
        NULL as bn_anexo, 
        q."exchangeRate" as am_tcambio, 
        q."exchangeRate" as am_tcambiousd, 
        '' as cd_cencosto,
        '' as ds_observacion, 
        '' as ds_Campo_libre1, 
        '' as ds_Campo_libre2, 
        '' as cd_tipoventa, 
        1 as in_estado, 
        q.date as dt_vence, 
        '' as cd_Etapa, 
        '' as ds_seguimiento_etapa, 
        B'0' as bl_ManejaOpciones, 
        0 as in_NumeroOpciones, 
        B'0' as bl_CerrarCotizacion, 
        0 as in_OpcionSeleccionada, 
        B'0' as bl_grupos, 
        '' as gk_sabre, 
        '' as cd_Especialista, 
        '' as cd_TipoFormaPagoProveedor, 
        '' as cd_MedioReservacion, 
        B'0' as bl_bloqueada, 
        '' as cd_usuario_Bloqueo, 
        '' as ds_AlertaSolicitud, 
        B'0' as bl_comisiona, 
        '' as ds_FormaDePago, 
        '' as ds_records, 
        B'0' as bl_entregadoCliente, 
        q.date as dt_entregadoCliente, 
        0 as id_sys_entidades, 
        '' as cd_MonedaPagoDestino, 
        '' as cd_FormaPagoDestino, 
        '' as ds_DocumentoPagoDestino, 
        q.date as dt_CheckInPagoDestino, 
        q.date as dt_CheckOutPagoDestino, 
        B'0' as bl_fechaPagoDestino, 
        '' as ds_hotelTieneTiquete, 
        '' as ds_GDS, 
        '' as cd_Evento, 
        q.id as orig_id_ref
    FROM public."Quotation" q
    JOIN public."Client" c ON q."clientId" = c.id
    JOIN public."Branch" b ON q."branchId" = b.id
    LEFT JOIN public."Implant" i ON q."implantId" = i.id
    LEFT JOIN public."Seller" s ON q."sellerId" = s.id
    LEFT JOIN public."TicketPrinter" t ON q."ticketPrinterId" = t.id
    LEFT JOIN public."User" u ON q."userId" = u.id -- Traer email del usuario creador
    WHERE q.id = ANY(string_to_array(Quotation_id, ',')::int[]);

    INSERT INTO CotizacionServicios (
        cd_TiposConceptFac, cd_ConceptoFacturacion, cd_TiposServicio, cd_Cotizacion,
        cd_fac_factura, cd_fac_remision, cd_proveedores, ds_tiposervnm, cd_prov_hotel,
        cd_prov_car, cd_prov_air, ds_destino, ds_servicio, ds_descrip, ds_paxname,
        ds_paxape, cd_paxtype, in_nacionalidad, cd_voucher, in_cantpax, dt_llegada,
        dt_salida, cd_cencosto, cd_auxiliar, cd_item, am_valorprov, cd_monedaprov,
        ds_InfoAdicional, cd_carrental, cd_hoteles, bl_anulado, cd_tiquete,
        cd_fuente_anul, cd_serie_anul, cd_consecutivo_anul, cd_usuario_anul,
        cd_sucursal_anul, cd_implante_anul, am_basecomisionable, am_porcomision,
        cd_voucherPrefijo, bl_notdomicilionacional, Valor_Comision, Valor_Recaudo,
        dias_recaudo, ds_paxClasificacion, cd_tipoplan, cd_acomodacion, in_dias,
        in_noches, ds_records, cd_GrConcepto, in_diasSrv, in_nochesSrv, cd_Especialista,
        am_porcentaje_descuento, am_valor_descuento, ds_motivo_descuento,
        cd_cargosdesc_descuento, in_NumeroOpcion, dt_FechaSalidaSrv, dt_FechaLlegadaSrv,
        cd_localizador, cd_voucherpax, am_basecomisionableprov, am_porcomisionprov,
        cd_NumeFac, dt_VenceFac, cd_AcomodacionSrv, cd_TipoPlanSrv, in_habitaciones,
        in_habitacionesSrv, cd_Consecutivo_VARiablesAdicionales, cd_confirmacion,
        ds_confirmadopor, cd_paxidentificacion, bl_politicaCancelacion,
        dt_politicaCancelacion, cd_tipoHabitacionacion, cd_fac_facturaComision,
        cd_fac_remisionComision, cd_TarjetaAsistencia, cd_Regiones, Iden_GDS, id_sys_entidades,
        ds_TipoAuto, ds_Origen, ds_DirOrigen, ds_DirDestino, ds_TipoTarifa, am_ValorUSD,
        ds_NoVuelo, ds_Vehiculo, ds_Placa, ds_CategoriaVehiculo, ds_NombreConductor,
        ds_telefono, ds_IdiomaConductor, cd_MonedaSrv, cd_TipoServicio, cd_Aerolinea,
        in_EdadPax, am_PorFacParcial, ds_GDS, dt_fechaficheroBBVA, bl_tiquete,
        am_basedescuento, am_pordescuento, cd_CotizacionServicios_Depende, 
		orig_id_ref, orig_id_quotationref, mainTaxId
    )
    SELECT 
        COALESCE(pr."type", '') as cd_TiposConceptFac, 
        COALESCE(pr."code", '') as cd_ConceptoFacturacion, 
        COALESCE(qp."serviceType", '') as cd_TiposServicio, 
        q.cd_consecutivo as cd_Cotizacion,
        '' as cd_fac_factura, 
        '' as cd_fac_remision, 
        COALESCE(prov.code, prov.name, '') as cd_proveedores, 
        COALESCE(qp."serviceType", '') as ds_tiposervnm, 
        '' as cd_prov_hotel,
        '' as cd_prov_car, 
        '' as cd_prov_air, 
        COALESCE(qp.destination, '') as ds_destino, 
        COALESCE(pr.description, '') as ds_servicio, 
        COALESCE(pr.description, '') as ds_descrip, 
		CASE 
	        WHEN qpp.name IS NULL OR TRIM(qpp.name) = '' THEN ''
	        WHEN TRIM(qpp.name) NOT LIKE '% %' THEN TRIM(qpp.name)
	        ELSE COALESCE(arr[1], '')
	    END AS ds_paxname,
	    CASE 
	        WHEN qpp.name IS NULL OR TRIM(qpp.name) = '' THEN ''
	        WHEN TRIM(qpp.name) NOT LIKE '% %' THEN ''
	        ELSE COALESCE(arr[2], '')
	    END AS ds_paxape,
        CASE 
	        WHEN TRIM(qpp.name) LIKE '% %' THEN COALESCE(arr[3], '')
	        ELSE ''
	    END as cd_paxtype, 
        COALESCE(qp."inNationality", 1) as in_nacionalidad, 
        '' as cd_voucher, 
        qp.quantity as in_cantpax, 
        COALESCE(qp."checkInDate", q.dt_fecha) as dt_llegada,
        COALESCE(qp."checkOutDate", q.dt_fecha) as dt_salida, 
        '' as cd_cencosto, 
        '' as cd_auxiliar, 
        '' as cd_item, 
        qp.price as am_valorprov, 
        qt.currency as cd_monedaprov,
        '' as ds_InfoAdicional, 
        '' as cd_carrental, 
        '' as cd_hoteles, 
        B'0' as bl_anulado, 
        '' as cd_tiquete,
        '' as cd_fuente_anul, 
        '' as cd_serie_anul, 
        '' as cd_consecutivo_anul, 
        '' as cd_usuario_anul,
        '' as cd_sucursal_anul, 
        '' as cd_implante_anul, 
        0 as am_basecomisionable, 
        0 as am_porcomision,
        '' as cd_voucherPrefijo, 
        B'0' as bl_notdomicilionacional, 
        0 as Valor_Comision, 
        0 as Valor_Recaudo,
        0 as dias_recaudo, 
        CASE 
	        WHEN TRIM(qpp.name) LIKE '% %' THEN COALESCE(arr[4], '')
	        ELSE ''
	    END  as ds_paxClasificacion, 
        '' as cd_tipoplan, 
        '' as cd_acomodacion, 
        0 as in_dias,
        COALESCE(qp.nights, 0) as in_noches, 
        '' as ds_records, 
        '' as cd_GrConcepto, 
        0 as in_diasSrv, 
        0 as in_nochesSrv, 
        '' as cd_Especialista,
        0 as am_porcentaje_descuento, 
        0 as am_valor_descuento, 
        '' as ds_motivo_descuento,
        '' as cd_cargosdesc_descuento, 
        0 as in_NumeroOpcion, 
        q.dt_fecha as dt_FechaSalidaSrv, 
        q.dt_fecha as dt_FechaLlegadaSrv,
        '' as cd_localizador, 
        '' as cd_voucherpax, 
        0 as am_basecomisionableprov, 
        0 as am_porcomisionprov,
        '' as cd_NumeFac, 
        q.dt_fecha as dt_VenceFac, 
        '' as cd_AcomodacionSrv, 
        '' as cd_TipoPlanSrv, 
        0 as in_habitaciones,
        0 as in_habitacionesSrv, 
        'Q' || LPAD(qp."id"::text, 7, '0') as cd_Consecutivo_VARiablesAdicionales, 
        '' as cd_confirmacion,
        '' as ds_confirmadopor, 
        COALESCE(qpp.document,'') as cd_paxidentificacion, 
        B'0' as bl_politicaCancelacion,
        q.dt_fecha as dt_politicaCancelacion, 
        '' as cd_tipoHabitacionacion, 
        '' as cd_fac_facturaComision,
        '' as cd_fac_remisionComision, 
        '' as cd_TarjetaAsistencia, 
        '' as cd_Regiones, 
        0 as Iden_GDS, 
        0 as id_sys_entidades,
        '' as ds_TipoAuto, 
        '' as ds_Origen, 
        '' as ds_DirOrigen, 
        '' as ds_DirDestino, 
        '' as ds_TipoTarifa, 
        0 as am_ValorUSD,
        '' as ds_NoVuelo, 
        '' as ds_Vehiculo, 
        '' as ds_Placa, 
        '' as ds_CategoriaVehiculo, 
        '' as ds_NombreConductor,
        '' as ds_telefono, 
        '' as ds_IdiomaConductor, 
        qt.currency as cd_MonedaSrv, 
        '' as cd_TipoServicio, 
        '' as cd_Aerolinea,
        0 as in_EdadPax, 
        0 as am_PorFacParcial, 
        '' as ds_GDS, 
        q.dt_fecha as dt_fechaficheroBBVA, 
        B'0' as bl_tiquete,
        0 as am_basedescuento, 
        0 as am_pordescuento, 
        '' as cd_CotizacionServicios_Depende, 
        qp.id as orig_id_ref,
		q.orig_id_ref as orig_id_quotationref,
		qp."mainTaxId" as mainTaxId
    FROM public."QuotationProduct" qp
	JOIN public."Quotation" qt ON qp."quotationId" = qt.id
    JOIN public."Product" pr ON qp."productId" = pr.id
    JOIN Cotizacion q ON qp."quotationId" = q.orig_id_ref
    LEFT JOIN public."Provider" prov ON qp."providerId" = prov."id"
	LEFT JOIN LATERAL ( SELECT  pp.*,
		        				regexp_split_to_array(TRIM(pp.name), '\s+') AS arr
		    			FROM public."QuotationProductPassenger" pp 
						WHERE pp."quotationProductId" = qp.id
    					ORDER BY pp.id
    					LIMIT 1) qpp ON true;

    --INSERT INTO CotizacionServicios_PaxAdicional (
    --    cd_Cotizacion, cd_CotizacionServicios, ds_paxape, ds_paxname, ds_paxprefix,
    --    ds_paxClasificacion, cd_voucherpax, cd_paxidentificacion, in_edad, cd_tiquete
    --)
    --SELECT 
    --    cs.cd_Cotizacion, 
    --    cs.cd_Consecutivo_VARiablesAdicionales as cd_CotizacionServicios, 
    --    '' as ds_paxape, 
    --    p.name as ds_paxname, 
    --    '' as ds_paxprefix, 
    --    '' as ds_paxClasificacion, 
    --    '' as cd_voucherpax, 
    --    p.document as cd_paxidentificacion, 
    --    0 as in_edad, 
    --    '' as cd_tiquete
    --FROM public."QuotationProductPassenger" p
    --JOIN CotizacionServicios cs ON p."quotationProductId" = cs.orig_id_ref;

	INSERT INTO CotizacionServicios_PaxAdicional (
				cd_Cotizacion,cd_CotizacionServicios, ds_paxape, ds_paxname, ds_paxprefix,
				ds_paxClasificacion, cd_voucherpax, cd_paxidentificacion,in_edad, cd_tiquete
	)
	SELECT 
	    cs.cd_Cotizacion, 
	    cs.cd_Consecutivo_VARiablesAdicionales AS cd_CotizacionServicios, 
	    CASE 
	        WHEN p.name IS NULL OR TRIM(p.name) = '' THEN ''
	        WHEN TRIM(p.name) NOT LIKE '% %' THEN ''
	        ELSE COALESCE(arr[2], '')
	    END AS ds_paxape,
	    CASE 
	        WHEN p.name IS NULL OR TRIM(p.name) = '' THEN ''
	        WHEN TRIM(p.name) NOT LIKE '% %' THEN TRIM(p.name)
	        ELSE COALESCE(arr[1], '')
	    END AS ds_paxname,
	    CASE 
	        WHEN TRIM(p.name) LIKE '% %' THEN COALESCE(arr[3], '')
	        ELSE ''
	    END AS ds_paxprefix,
	    CASE 
	        WHEN TRIM(p.name) LIKE '% %' THEN COALESCE(arr[4], '')
	        ELSE ''
	    END AS ds_paxClasificacion,
	    CASE 
	        WHEN TRIM(p.name) LIKE '% %' THEN COALESCE(arr[5], '')
	        ELSE ''
	    END AS cd_voucherpax,
	    p.document AS cd_paxidentificacion, 
	    0 AS in_edad, 
	    '' AS cd_tiquete
		FROM (
		    SELECT 
		        p.*,
		        regexp_split_to_array(TRIM(p.name), '\s+') AS arr,
		        ROW_NUMBER() OVER (
		            PARTITION BY p."quotationProductId"
		            ORDER BY p.id
		        ) AS rn
		    FROM public."QuotationProductPassenger" p
		) p
		JOIN CotizacionServicios cs 
		    ON p."quotationProductId" = cs.orig_id_ref
		WHERE p.rn > 1;

    INSERT INTO CotizacionServicios_VariableAdicional (
        cd_Cotizacion, cd_CotizacionServicios, ds_maestro, ds_VariableAdicional, ds_valor, cd_codigo
    )
    SELECT 
        cs.cd_Cotizacion, 
        cs.cd_Consecutivo_VARiablesAdicionales as cd_CotizacionServicios, 
        'CotizacionServicios' as ds_maestro, 
        mv.name as ds_VariableAdicional, 
        v.value as ds_valor, 
        mv.code as cd_codigo
    FROM public."QuotationProductVariable" v
    JOIN public."MasterVariable" mv ON v."masterVariableId" = mv."id"
    JOIN CotizacionServicios cs ON v."quotationProductId" = cs.orig_id_ref;

    -- SEPARACIÓN CARGOS vs IMPUESTOS
    INSERT INTO CotizacionCargos (
        cd_CotizacionServicios, cd_CotizacionCargos, cd_cargosdesc, ds_cargonm, bl_noshow, am_contado,
        am_credito, am_contado_ME, am_credito_ME, orig_id_ref, cd_Cotizacion
    )
    SELECT 
        cs.cd_Consecutivo_VARiablesAdicionales as cd_CotizacionServicios,
		t."id"::text as cd_CotizacionCargos,
        COALESCE(ct.code, '') as cd_cargosdesc, 
        COALESCE(ct.name, '') as ds_cargonm, 
        B'0' as bl_noshow, 
        t."explicitAmount" as am_contado, 
        0 as am_credito, 
        0 as am_contado_ME, 
        0 as am_credito_ME, 
        t.id as orig_id_ref,
		cs.cd_Cotizacion as cd_Cotizacion 
    FROM public."QuotationProductTax" t
    JOIN public."ChargeAndTax" ct ON t."chargeAndTaxId" = ct.id
    JOIN CotizacionServicios cs ON t."quotationProductId" = cs.orig_id_ref
    WHERE ct.type <> 'TAX';

    INSERT INTO CotizacionImpuestos (
        cd_CotizacionCargos, cd_CotizacionImpuestos, cd_ImpRet, ds_Impas, cd_impcta, am_porcentaje,
        bl_contabilizar, am_contado, am_credito, am_contado_ME, am_credito_ME,
		cd_CotizacionServicios, cd_Cotizacion
    )
    SELECT 
        COALESCE(tp."id", 1)::text  as cd_CotizacionCargos,
		t."id"::text as cd_CotizacionImpuestos,
        COALESCE(ct."code", '') as cd_ImpRet, 
        COALESCE(ct."name", '') as ds_Impas, 
        '' as cd_impcta, 
        COALESCE(t."valueSnapshot", 0) as am_porcentaje,
        B'0' as bl_contabilizar, 
        COALESCE(t."explicitAmount", 0) as am_contado, 
        0 as am_credito, 
        0 as am_contado_ME, 
        0 as am_credito_ME,
		cs.cd_Consecutivo_VARiablesAdicionales as cd_CotizacionServicios, 
		c.cd_Consecutivo as cd_Cotizacion 
    FROM public."QuotationProductTax" t
    JOIN public."ChargeAndTax" ct ON t."chargeAndTaxId" = ct.id
    JOIN CotizacionServicios cs ON t."quotationProductId" = cs.orig_id_ref
	JOIN Cotizacion c ON c.orig_id_ref = cs.orig_id_quotationref
	LEFT JOIN public."QuotationProductTax" tp ON tp."quotationProductId" = cs.orig_id_ref and tp."chargeAndTaxId" = cs.mainTaxId
    WHERE ct.type = 'TAX';

	INSERT INTO Fac_Servicios_TiposFacturacionHoteles(
		cd_Cotizacion,
		cd_CotizacionServicios,
		cd_TiposFacturacionHoteles,
		cd_cargosdesc,
		in_cantidad,
		am_contado,
		am_credito,
		ds_cargonm
	)	
	SELECT 
		'Q' || LPAD(qp."quotationId"::text, 7, '0') as cd_Cotizacion, 
		'Q' || LPAD(qp."id"::text, 7, '0') as cd_CotizacionServicios,
		'NCH' AS cd_TiposFacturacionHoteles, --ADT Adulto,CHD Niño,HAB Habitacion,CAN Cantidad,NCH Noches
		COALESCE(ct."code",'TAR') AS cd_cargosdesc,
		COALESCE(qp."quantity",0) AS in_cantidad,
		COALESCE(tp."explicitAmount",0)/COALESCE(qp."quantity",1) AS am_contado,
		0 AS am_credito,
		COALESCE(ct."name",'Tarifa') AS ds_cargonm
	FROM public."QuotationProduct" qp
	LEFT JOIN public."ChargeAndTax" ct ON ct.id = qp."mainTaxId"
	LEFT JOIN public."QuotationProductTax" tp ON tp."quotationProductId" = qp."id" and tp."chargeAndTaxId" = qp."mainTaxId";

    -- 5. Generar XML
    SELECT xmlroot(
        xmlelement(name "Cotizaciones",
            xmlagg(
                xmlelement(name "Cotizacion",
                    xmlforest(
                        q.cd_sucursal, q.cd_implante, q.cd_consecutivo, q.cd_usuario,
                        q.dt_fechacont, q.dt_fecha, q.cd_usuarioAct, q.dt_fechaAct,
                        q.cd_tercero_codigo, q.ds_tercero_nombre, q.cd_cliente_codigo,
                        q.ds_cliente_nombre, q.ds_cliente_dir, q.ds_cliente_ciudad,
                        q.ds_cliente_tel, q.ds_cliente_dirdesp, q.ds_cliente_email,
                        q.ds_cliente_contacto, q.ds_cliente_contacto_email, q.cd_monedas_IATA,
                        q.cd_vendedor, q.cd_tiqueteador, q.bn_anexo, q.am_tcambio,
                        q.am_tcambiousd, q.cd_cencosto, q.ds_observacion, q.ds_Campo_libre1,
                        q.ds_Campo_libre2, q.cd_tipoventa, q.in_estado, q.dt_vence,
                        q.cd_Etapa, q.ds_seguimiento_etapa, q.bl_ManejaOpciones,
                        q.in_NumeroOpciones, q.bl_CerrarCotizacion, q.in_OpcionSeleccionada,
                        q.bl_grupos, q.gk_sabre, q.cd_Especialista, q.cd_TipoFormaPagoProveedor,
                        q.cd_MedioReservacion, q.bl_bloqueada, q.cd_usuario_Bloqueo,
                        q.ds_AlertaSolicitud, q.bl_comisiona, q.ds_FormaDePago, q.ds_records,
                        q.bl_entregadoCliente, q.dt_entregadoCliente, q.id_sys_entidades,
                        q.cd_MonedaPagoDestino, q.cd_FormaPagoDestino, q.ds_DocumentoPagoDestino,
                        q.dt_CheckInPagoDestino, q.dt_CheckOutPagoDestino, q.bl_fechaPagoDestino,
                        q.ds_hotelTieneTiquete, q.ds_GDS, q.cd_Evento
                    ),
                    (
                        SELECT xmlagg(
                            xmlelement(name "CotizacionServicios",
                                xmlforest(
                                    s.cd_TiposConceptFac, s.cd_ConceptoFacturacion, s.cd_TiposServicio,
                                    s.cd_Cotizacion, s.cd_fac_factura, s.cd_fac_remision,
                                    s.cd_proveedores, s.ds_tiposervnm, s.cd_prov_hotel,
                                    s.cd_prov_car, s.cd_prov_air, s.ds_destino, s.ds_servicio,
                                    s.ds_descrip, s.ds_paxname, s.ds_paxape, s.cd_paxtype,
                                    s.in_nacionalidad, s.cd_voucher, s.in_cantpax, s.dt_llegada,
                                    s.dt_salida, s.cd_cencosto, s.cd_auxiliar, s.cd_item,
                                    s.am_valorprov, s.cd_monedaprov, s.ds_InfoAdicional,
                                    s.cd_carrental, s.cd_hoteles, s.bl_anulado, s.cd_tiquete,
                                    s.cd_fuente_anul, s.cd_serie_anul, s.cd_consecutivo_anul,
                                    s.cd_usuario_anul, s.cd_sucursal_anul, s.cd_implante_anul,
                                    s.am_basecomisionable, s.am_porcomision, s.cd_voucherPrefijo,
                                    s.bl_notdomicilionacional, s.Valor_Comision, s.Valor_Recaudo,
                                    s.dias_recaudo, s.ds_paxClasificacion, s.cd_tipoplan,
                                    s.cd_acomodacion, s.in_dias, s.in_noches, s.ds_records,
                                    s.cd_GrConcepto, s.in_diasSrv, s.in_nochesSrv, s.cd_Especialista,
                                    s.am_porcentaje_descuento, s.am_valor_descuento,
                                    s.ds_motivo_descuento, s.cd_cargosdesc_descuento,
                                    s.in_NumeroOpcion, s.dt_FechaSalidaSrv, s.dt_FechaLlegadaSrv,
                                    s.cd_localizador, s.cd_voucherpax, s.am_basecomisionableprov,
                                    s.am_porcomisionprov, s.cd_NumeFac, s.dt_VenceFac,
                                    s.cd_AcomodacionSrv, s.cd_TipoPlanSrv, s.in_habitaciones,
                                    s.in_habitacionesSrv, s.cd_Consecutivo_VARiablesAdicionales,
                                    s.cd_confirmacion, s.ds_confirmadopor, s.cd_paxidentificacion,
                                    s.bl_politicaCancelacion, s.dt_politicaCancelacion,
                                    s.cd_tipoHabitacionacion, s.cd_fac_facturaComision,
                                    s.cd_fac_remisionComision, s.cd_TarjetaAsistencia,
                                    s.cd_Regiones, s.Iden_GDS, s.id_sys_entidades,
                                    s.ds_TipoAuto, s.ds_Origen, s.ds_DirOrigen, s.ds_DirDestino, s.ds_TipoTarifa,
                                    s.am_ValorUSD, s.ds_NoVuelo, s.ds_Vehiculo, s.ds_Placa,
                                    s.ds_CategoriaVehiculo, s.ds_NombreConductor, s.ds_telefono,
                                    s.ds_IdiomaConductor, s.cd_MonedaSrv, s.cd_TipoServicio,
                                    s.cd_Aerolinea, s.in_EdadPax, s.am_PorFacParcial, s.ds_GDS,
                                    s.dt_fechaficheroBBVA, s.bl_tiquete, s.am_basedescuento,
                                    s.am_pordescuento, s.cd_CotizacionServicios_Depende
                                ),
                                (
                                    SELECT xmlagg(
                                        xmlelement(name "CotizacionServicios_PaxAdicional",
                                            xmlforest(
                                                p.cd_Cotizacion, p.cd_CotizacionServicios, p.ds_paxape,
                                                p.ds_paxname, p.ds_paxprefix, p.ds_paxClasificacion,
                                                p.cd_voucherpax, p.cd_paxidentificacion, p.in_edad,
                                                p.cd_tiquete
                                            )
                                        )
                                    )
                                    FROM CotizacionServicios_PaxAdicional p
                                    WHERE p.cd_CotizacionServicios = s.cd_Consecutivo_VARiablesAdicionales
                                ),
                                (
                                    SELECT xmlagg(
                                        xmlelement(name "CotizacionServicios_VariableAdicional",
                                            xmlforest(
                                                v.cd_Cotizacion, v.cd_CotizacionServicios, v.ds_maestro,
                                                v.ds_VariableAdicional, v.ds_valor, v.cd_codigo
                                            )
                                        )
                                    )
                                    FROM CotizacionServicios_VariableAdicional v
                                    WHERE v.cd_CotizacionServicios = s.cd_Consecutivo_VARiablesAdicionales
                                ),
                                (
                                    SELECT xmlagg(
                                        xmlelement(name "CotizacionCargos",
                                            xmlforest(
                                                cr.cd_CotizacionServicios, cr.cd_cargosdesc,
                                                cr.ds_cargonm, cr.bl_noshow, cr.am_contado,
                                                cr.am_credito, cr.am_valor, cr.am_contado_ME,
                                                cr.am_credito_ME, cr.am_valor_ME,
												cr.orig_id_ref::text AS cd_CotizacionCargos,
												cr.cd_Cotizacion as cd_Cotizacion 
                                            )
                                        )
                                    )
                                    FROM CotizacionCargos cr
                                    WHERE cr.cd_CotizacionServicios = s.cd_Consecutivo_VARiablesAdicionales
                                ),
                                (
                                    SELECT xmlagg(
                                        xmlelement(name "CotizacionImpuestos",
                                            xmlforest(
                                                imp.cd_CotizacionServicios, imp.cd_CotizacionCargos, imp.cd_ImpRet,
                                                imp.ds_Impas, imp.cd_impcta, imp.am_porcentaje,
                                                imp.bl_contabilizar, imp.am_contado,
                                                imp.am_credito, imp.am_valor, imp.am_contado_ME,
                                                imp.am_credito_ME, imp.am_valor_ME,
												imp.cd_CotizacionImpuestos AS cd_CotizacionImpuestos,
												imp.cd_Cotizacion as cd_Cotizacion 
                                            )
                                        )
                                    )
                                    FROM CotizacionImpuestos imp
                                    WHERE imp.cd_CotizacionServicios = s.cd_Consecutivo_VARiablesAdicionales
                                ),
								(
									SELECT xmlagg(
                                        xmlelement(name "Fac_Servicios_TiposFacturacionHoteles",
                                            xmlforest(
													TF.cd_Cotizacion as cd_Cotizacion,
													TF.cd_CotizacionServicios as cd_CotizacionServicios,
													TF.cd_TiposFacturacionHoteles as cd_TiposFacturacionHoteles,
													TF.cd_cargosdesc as cd_cargosdesc,
													TF.in_cantidad as in_cantidad,
													TF.am_contado as am_contado,
													TF.am_credito as am_credito,
													TF.am_valor as am_valor,
													TF.ds_cargonm as ds_cargonm
											)
                                        )
                                    )				
									FROM Fac_Servicios_TiposFacturacionHoteles TF
									WHERE TF.cd_CotizacionServicios = s.cd_Consecutivo_VARiablesAdicionales
								)
                            )
                        )
                        FROM CotizacionServicios s
                        WHERE s.cd_Cotizacion = q.cd_consecutivo
                    )
                )
            )
        ),
        version '1.0', standalone yes
    )::text INTO v_xml
    FROM Cotizacion q;

    -- 6. Resultado Final
    mensaje_resultado := coalesce(v_xml, '<?xml version="1.0" standalone="yes"?><Cotizaciones />');

EXCEPTION
    WHEN OTHERS THEN
	
		-- 1. Capturar los diagnósticos del error
        GET STACKED DIAGNOSTICS 
            v_state   = RETURNED_SQLSTATE,
            v_msg     = MESSAGE_TEXT,
            v_context = PG_EXCEPTION_CONTEXT;

        -- 2. Extraer la línea del texto del contexto (usando Regex)
		v_line :=substring(v_context from 'line ([0-9]+)')::TEXT;
	

        mensaje_resultado := format('ERROR: %s | EN LÍNEA: %s | ESTADO: %s', v_msg, v_line, v_state);
END;
$$;

-- Archivo: spImportQuotation.sql
CREATE OR REPLACE PROCEDURE public."spImportQuotation"(
    IN p_text_data TEXT,
    IN p_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
/*
    AUTOR: Rubiel Gelis Guzman / Antigravity
    DESCRIPCIÓN: Importación masiva de cotizaciones desde TEXTO PLANO DELIMITADO.
    Formato esperado: 28 Columnas separadas por '^' y Filas por salto de línea.
*/
DECLARE
    v_row_text TEXT;
    v_cols TEXT[];
    v_quotation_record RECORD;
    v_product_record RECORD;
    v_quotation_id INT;
    v_qp_id INT;
    v_internal_number TEXT;
    v_client_id INT;
    v_branch_id INT;
    v_implant_id INT;
    v_seller_id INT;
    v_ticket_printer_id INT;
    v_product_id INT;
    v_provider_id INT;
    v_prestadora_id INT;
    v_tax_id INT;
    v_main_tax_id INT;
    v_variable_id INT;
    v_tax_item TEXT;
    v_tax_parts TEXT[];
    v_pass_item TEXT;
    v_pass_parts TEXT[];
    v_var_item TEXT;
    v_var_parts TEXT[];
    v_total_amount DECIMAL := 0;
    v_imported_count INT := 0;
    v_created_ids TEXT := '';
BEGIN
    -- 1. Crear tabla temporal
    CREATE TEMP TABLE IF NOT EXISTS tmp_import_rows (
        row_id INT GENERATED ALWAYS AS IDENTITY, --0
        grupo TEXT, --1
        cliente_doc TEXT, --2
        sucursal_cd TEXT, --3
        implant_cd TEXT, --4
        vendedor_cd TEXT, --5
        tiqueteador_cd TEXT, --6
        moneda TEXT, --7
        tasa_cambio DECIMAL, -- 8
        comision_global DECIMAL, -- 9
        cargos_global DECIMAL, --10
        producto_cd TEXT, --11
        proveedor_nm TEXT, --12 
        proveedor_cd TEXT, --13
        prestadora_cd TEXT, --14
        impuestos_str TEXT, --15
        variables_str TEXT, --16
        pasajeros_str TEXT, --17
        precio DECIMAL, --18
        cantidad INT, --19
        check_in TIMESTAMP, --20
        check_out TIMESTAMP, --21
        pax_adultos INT, --22
        pax_ninos INT, --23
        destino TEXT, --24
        tipo_servicio TEXT, --25
        reserva TEXT, --26
        com_vendedor DECIMAL, --27
        com_tiqueteador DECIMAL, --28
        combos_str TEXT, --29
        nacionalidad INT DEFAULT 1, --30
        cargo_principal_cd TEXT, --31
		cost DECIMAL DEFAULT 0--32
    ) ON COMMIT DROP;

    DELETE FROM tmp_import_rows;

    -- 2. "Split" del Texto a Tabla Temporal
    FOR v_row_text IN SELECT unnest(string_to_array(p_text_data, E'\n')) LOOP
        v_imported_count := v_imported_count + 1;
        IF TRIM(v_row_text) = '' THEN CONTINUE; END IF;
        
        BEGIN
            v_cols := string_to_array(v_row_text, '^');

            -- Validar formato de Check-In (Acepta YYYY-MM-DD y opcionalmente YYYY-MM-DD HH:MM:SS)
            IF TRIM(v_cols[20]) <> '' AND TRIM(v_cols[20]) !~ '^\d{4}-\d{2}-\d{2}' THEN
                p_mensaje_resultado := 'ERROR en FILA ' || v_imported_count || ': Formato incorrecto en la fecha de Check-In. Se esperaba YYYY-MM-DD. Valor: ' || TRIM(v_cols[20]);
                RETURN;
            END IF;

            -- Validar formato de Check-Out (Acepta YYYY-MM-DD y opcionalmente YYYY-MM-DD HH:MM:SS)
            IF TRIM(v_cols[21]) <> '' AND TRIM(v_cols[21]) !~ '^\d{4}-\d{2}-\d{2}' THEN
                p_mensaje_resultado := 'ERROR en FILA ' || v_imported_count || ': Formato incorrecto en la fecha de Check-Out. Se esperaba YYYY-MM-DD. Valor: ' || TRIM(v_cols[21]);
                RETURN;
            END IF;
            
            INSERT INTO tmp_import_rows (
                grupo, -- 1
				cliente_doc, -- 2 
				sucursal_cd, -- 3
				implant_cd, -- 4
				vendedor_cd, -- 5
				tiqueteador_cd, -- 6
                moneda, -- 7
				tasa_cambio, -- 8 
				comision_global, -- 9
				cargos_global, -- 10
				producto_cd, -- 11
                proveedor_nm, -- 12
				proveedor_cd, -- 13
				prestadora_cd, -- 14
				impuestos_str, -- 15
				variables_str, -- 16
				pasajeros_str, -- 17
                precio, -- 18
				cantidad, -- 19
				check_in, -- 20
				check_out, -- 21
				pax_adultos, -- 22
				pax_ninos, -- 23
                destino, -- 24
				tipo_servicio, -- 25
				reserva, -- 26
				com_vendedor, -- 27 
				com_tiqueteador, -- 28
                combos_str, -- 29
				nacionalidad, -- 30
				cargo_principal_cd, -- 31
				cost -- 32
            ) VALUES (
                TRIM(v_cols[1]), -- grupo 
				TRIM(v_cols[2]), -- cliente_doc 
				TRIM(v_cols[3]), -- sucursal_cd
				TRIM(v_cols[4]), -- implant_cd
				TRIM(v_cols[5]), -- vendedor_cd
				TRIM(v_cols[6]), -- tiqueteador_cd
                TRIM(v_cols[7]), -- moneda
				NULLIF(TRIM(v_cols[8]), '')::DECIMAL, -- tasa_cambio
				NULLIF(TRIM(v_cols[9]), '')::DECIMAL, -- comision_global
                NULLIF(TRIM(v_cols[10]), '')::DECIMAL, --cargos_global
				TRIM(v_cols[11]), -- Producto Codigo
                TRIM(v_cols[12]), -- Prov Nombre
                TRIM(v_cols[13]), -- Prov Codigo
                TRIM(v_cols[14]), -- Prestadora Codigo
                TRIM(v_cols[15]), -- Vars
				TRIM(v_cols[16]), -- Impuestos
				TRIM(v_cols[17]), -- Pasajeros
                NULLIF(TRIM(v_cols[18]), '')::DECIMAL, -- precio
				NULLIF(TRIM(v_cols[19]), '')::INT, -- cantidad
                CASE WHEN TRIM(v_cols[20]) <> '' THEN TRIM(v_cols[20])::TIMESTAMP ELSE NULL END, -- check_in
                CASE WHEN TRIM(v_cols[21]) <> '' THEN TRIM(v_cols[21])::TIMESTAMP ELSE NULL END, -- check_out
                NULLIF(TRIM(v_cols[22]), '')::INT, -- pax_adultos
				NULLIF(TRIM(v_cols[23]), '')::INT, -- pax_ninos
                TRIM(v_cols[24]), -- destino
				TRIM(v_cols[25]), -- tipo_servicio
				TRIM(v_cols[26]), -- reserva 
                NULLIF(TRIM(v_cols[27]), '')::DECIMAL, -- comision vendedor
				NULLIF(TRIM(v_cols[28]), '')::DECIMAL, -- comision tiqueteador
                TRIM(v_cols[29]), -- codigo combos
				COALESCE(NULLIF(TRIM(v_cols[30]), '')::INT, 1), -- nacionalidad
                TRIM(v_cols[31]), --cargo_principal_cd
				NULLIF(TRIM(v_cols[32]), '')::DECIMAL --costo
            );
        EXCEPTION WHEN OTHERS THEN
            p_mensaje_resultado := 'ERROR en FILA ' || v_imported_count || ': ' || SQLERRM || ' (Valor: ' || v_row_text || ')';
            RETURN;
        END;
    END LOOP;

    v_imported_count := 0;

    -- 3. Procesar Grupos
    FOR v_quotation_record IN (
        SELECT grupo, 
               MAX(cliente_doc) as cliente_doc, 
               MAX(sucursal_cd) as sucursal_cd, 
               MAX(implant_cd) as implant_cd, 
               MAX(vendedor_cd) as vendedor_cd, 
               MAX(tiqueteador_cd) as tiqueteador_cd, 
               MAX(moneda) as moneda, 
               MAX(tasa_cambio) as tasa_cambio, 
               MAX(comision_global) as comision_global, 
               MAX(cargos_global) as cargos_global,
               MAX(combos_str) as combos_str
        FROM tmp_import_rows
        GROUP BY grupo
    ) LOOP
        -- Resolución de Maestros
        SELECT id INTO v_client_id FROM public."Client" WHERE document = v_quotation_record.cliente_doc;
        IF v_client_id IS NULL THEN 
            p_mensaje_resultado := 'ERROR: Cliente con documento o código "' || v_quotation_record.cliente_doc || '" no encontrado en el sistema.';
            RETURN;
        END IF;

        SELECT id INTO v_branch_id FROM public."Branch" WHERE LOWER(code) = LOWER(v_quotation_record.sucursal_cd);
        IF v_branch_id IS NULL THEN 
            p_mensaje_resultado := 'ERROR: Sucursal con código "' || v_quotation_record.sucursal_cd || '" no encontrada en el sistema.';
            RETURN;
        END IF;

        SELECT id INTO v_implant_id FROM public."Implant" WHERE LOWER(code) = LOWER(v_quotation_record.implant_cd);
        SELECT id INTO v_seller_id FROM public."Seller" WHERE LOWER(code) = LOWER(v_quotation_record.vendedor_cd);
        SELECT id INTO v_ticket_printer_id FROM public."TicketPrinter" WHERE LOWER(code) = LOWER(v_quotation_record.tiqueteador_cd);

        v_internal_number := 'QUO-SP-' || to_char(now(), 'YYYYMMDD') || '-' || floor(random() * 10000)::TEXT;

        RAISE NOTICE 'DEBUG: moneda=%, tasa=%, seller=%', v_quotation_record.moneda, v_quotation_record.tasa_cambio, v_quotation_record.vendedor_cd;
        INSERT INTO public."Quotation" (
            "internalNumber", "date", "clientId", "currency", "exchangeRate", 
            "branchId", "implantId", "sellerId", "ticketPrinterId", 
            "baseCommissionable", "commissionPercentage", "chargesAndTaxes", "totalAmount", "userId"
        ) VALUES (
            v_internal_number, now(), v_client_id, COALESCE(v_quotation_record.moneda, 'COP'), 
            COALESCE(v_quotation_record.tasa_cambio, 1), v_branch_id, v_implant_id, v_seller_id, 
            v_ticket_printer_id, 0, COALESCE(v_quotation_record.comision_global, 0), 
            COALESCE(v_quotation_record.cargos_global, 0), 0, p_user_id
        ) RETURNING id INTO v_quotation_id;

        v_created_ids := v_created_ids || v_quotation_id || ',';

        v_total_amount := COALESCE(v_quotation_record.cargos_global, 0);

        -- Procesar Combos (Expandir productos del combo)
        IF v_quotation_record.combos_str IS NOT NULL AND v_quotation_record.combos_str <> '' THEN
            FOR v_var_item IN SELECT unnest(string_to_array(v_quotation_record.combos_str, '|')) LOOP
                DECLARE
                    v_combo_id INT;
                    v_cp_record RECORD;
                BEGIN
                    SELECT id INTO v_combo_id FROM public."Combo" WHERE LOWER(code) = LOWER(TRIM(v_var_item));
                    IF v_combo_id IS NOT NULL THEN
                        INSERT INTO public."QuotationCombo" ("quotationId", "comboId") VALUES (v_quotation_id, v_combo_id);
                        
                        -- Insertar productos del combo
                        FOR v_cp_record IN (SELECT * FROM public."ComboProduct" WHERE "comboId" = v_combo_id) LOOP
                            INSERT INTO public."QuotationProduct" (
                                "quotationId", "productId", "quantity", "price", "comboId", "mainTaxId", "inNationality", "cost"
                            ) VALUES (
                                v_quotation_id, v_cp_record."productId", v_cp_record.quantity, v_cp_record.price, v_combo_id, v_cp_record."mainTaxId", v_cp_record."inNationality", v_cp_record."cost"
                            ) RETURNING id INTO v_qp_id;

                            v_total_amount := v_total_amount + (v_cp_record.price * v_cp_record.quantity);

                            -- Insertar impuestos del combo product
                            INSERT INTO public."QuotationProductTax" (
                                "quotationProductId", "chargeAndTaxId", "valueSnapshot", "valueTypeSnapshot", "explicitAmount", "isMain"
                            )
                            SELECT v_qp_id, cpt."chargeAndTaxId", ct.value, ct."valueType", cpt.amount, cpt."isMain"
                            FROM public."ComboProductTax" cpt
                            JOIN public."ChargeAndTax" ct ON cpt."chargeAndTaxId" = ct.id
                            WHERE cpt."comboProductId" = v_cp_record.id;
                            
                            -- Sumar impuestos al total
                            v_total_amount := v_total_amount + COALESCE((SELECT SUM(amount) FROM public."ComboProductTax" WHERE "comboProductId" = v_cp_record.id), 0);
                        END LOOP;
                    END IF;
                END;
            END LOOP;
        END IF;

        -- Procesar Productos Individuales
        FOR v_product_record IN (SELECT * FROM tmp_import_rows WHERE grupo = v_quotation_record.grupo) LOOP
            SELECT id INTO v_product_id FROM public."Product" WHERE LOWER(code) = LOWER(v_product_record.producto_cd);
            IF v_product_id IS NULL THEN CONTINUE; END IF; 

            -- Resolución de Proveedor por Código
            v_provider_id := NULL;
            IF v_product_record.proveedor_cd <> '' THEN
                SELECT id INTO v_provider_id FROM public."Provider" WHERE LOWER(code) = LOWER(v_product_record.proveedor_cd);
            END IF;

            SELECT id INTO v_prestadora_id FROM public."Prestadora" WHERE LOWER(code) = LOWER(v_product_record.prestadora_cd);

            v_main_tax_id := NULL;
            IF v_product_record.cargo_principal_cd <> '' THEN
                SELECT id INTO v_main_tax_id FROM public."ChargeAndTax" WHERE LOWER(code) = LOWER(v_product_record.cargo_principal_cd);
            END IF;

            v_qp_id := NULL;
            SELECT id INTO v_qp_id FROM public."QuotationProduct" 
            WHERE "quotationId" = v_quotation_id AND "productId" = v_product_id AND "comboId" IS NOT NULL
            LIMIT 1;

            IF v_qp_id IS NOT NULL THEN
                UPDATE public."QuotationProduct" SET
                    "quantity" = COALESCE(v_product_record.cantidad, "quantity"),
                    "price" = COALESCE(v_product_record.precio, "price"),
                    "providerId" = COALESCE(v_provider_id, "providerId"),
                    "prestadoraId" = COALESCE(v_prestadora_id, "prestadoraId"),
                    "checkInDate" = COALESCE(v_product_record.check_in, "checkInDate"),
                    "checkOutDate" = COALESCE(v_product_record.check_out, "checkOutDate"),
                    "nights" = CASE WHEN v_product_record.check_in IS NOT NULL AND v_product_record.check_out IS NOT NULL 
                                 THEN EXTRACT(DAY FROM (v_product_record.check_out - v_product_record.check_in))::INT 
                                 ELSE "nights" END,
                    "paxAdults" = COALESCE(v_product_record.pax_adultos, "paxAdults"),
                    "paxChildren" = COALESCE(v_product_record.pax_ninos, "paxChildren"),
                    "serviceType" = COALESCE(v_product_record.tipo_servicio, "serviceType"),
                    "destination" = COALESCE(v_product_record.destino, "destination"),
                    "reservationCode" = COALESCE(v_product_record.reserva, "reservationCode"),
                    "sellerCommission" = COALESCE(v_product_record.com_vendedor, "sellerCommission"),
                    "ticketPrinterCommission" = COALESCE(v_product_record.com_tiqueteador, "ticketPrinterCommission"),
                    "inNationality" = COALESCE(v_product_record.nacionalidad, "inNationality"),
                    "mainTaxId" = COALESCE(v_main_tax_id, "mainTaxId"),
					"cost" = COALESCE(v_product_record.cost, "cost")
                WHERE id = v_qp_id;

                -- Eliminar impuestos base del combo si hay overrides en Excel
                IF v_product_record.impuestos_str IS NOT NULL AND v_product_record.impuestos_str <> '' THEN
                    DELETE FROM public."QuotationProductTax" WHERE "quotationProductId" = v_qp_id;
                END IF;
            ELSE
                IF v_quotation_record.combos_str IS NOT NULL AND v_quotation_record.combos_str <> '' THEN
                    CONTINUE; -- No crear productos diferentes a los del combo
                END IF;

                INSERT INTO public."QuotationProduct" (
                    "quotationId", "productId", "quantity", "price", "providerId", "prestadoraId", 
                    "checkInDate", "checkOutDate", "nights", "paxAdults", "paxChildren", 
                    "serviceType", "destination", "reservationCode", "sellerCommission", "ticketPrinterCommission",
                    "inNationality", "mainTaxId", "cost"
                ) VALUES (
                    v_quotation_id, v_product_id, COALESCE(v_product_record.cantidad, 1), 
                    COALESCE(v_product_record.precio, 0), v_provider_id, v_prestadora_id, 
                    v_product_record.check_in, v_product_record.check_out, 
                    CASE WHEN v_product_record.check_in IS NOT NULL AND v_product_record.check_out IS NOT NULL 
                         THEN EXTRACT(DAY FROM (v_product_record.check_out - v_product_record.check_in))::INT 
                         ELSE 1 END,
                    COALESCE(v_product_record.pax_adultos, 1), COALESCE(v_product_record.pax_ninos, 0),
                    v_product_record.tipo_servicio, v_product_record.destino, v_product_record.reserva,
                    v_product_record.com_vendedor, v_product_record.com_tiqueteador,
                    COALESCE(v_product_record.nacionalidad, 1), v_main_tax_id, v_product_record.cost
                ) RETURNING id INTO v_qp_id;
            END IF;

            v_total_amount := v_total_amount + (COALESCE(v_product_record.precio, 0) * COALESCE(v_product_record.cantidad, 1));

            -- Split para Impuestos
            IF v_product_record.impuestos_str IS NOT NULL AND v_product_record.impuestos_str <> '' THEN
                FOREACH v_tax_item IN ARRAY string_to_array(v_product_record.impuestos_str, '|') LOOP
                    v_tax_parts := string_to_array(v_tax_item, ':');
                    SELECT id INTO v_tax_id FROM public."ChargeAndTax" WHERE LOWER(code) = LOWER(TRIM(v_tax_parts[1]));
                    IF v_tax_id IS NOT NULL THEN
                        INSERT INTO public."QuotationProductTax" (
                            "quotationProductId", "chargeAndTaxId", "valueSnapshot", "valueTypeSnapshot", "explicitAmount"
                        ) 
                        SELECT v_qp_id, id, value, "valueType", NULLIF(TRIM(v_tax_parts[2]), '')::DECIMAL
                        FROM public."ChargeAndTax" WHERE id = v_tax_id;
                        v_total_amount := v_total_amount + NULLIF(TRIM(v_tax_parts[2]), '')::DECIMAL;
                    END IF;
                END LOOP;
            END IF;

            -- Split para Pasajeros
            IF v_product_record.pasajeros_str IS NOT NULL AND v_product_record.pasajeros_str <> '' THEN
                FOREACH v_pass_item IN ARRAY string_to_array(v_product_record.pasajeros_str, '|') LOOP
                    v_pass_parts := string_to_array(v_pass_item, ':');
                    INSERT INTO public."QuotationProductPassenger" ("quotationProductId", "name", "document")
                    VALUES (v_qp_id, COALESCE(v_pass_parts[1], ''), COALESCE(v_pass_parts[2], ''));
                END LOOP;
            END IF;

            -- Split para Variables
            IF v_product_record.variables_str IS NOT NULL AND v_product_record.variables_str <> '' THEN
                FOREACH v_var_item IN ARRAY string_to_array(v_product_record.variables_str, '|') LOOP
                    v_var_parts := string_to_array(v_var_item, ':');
                    SELECT id INTO v_variable_id FROM public."MasterVariable" WHERE LOWER(code) = LOWER(TRIM(v_var_parts[1]));
                    IF v_variable_id IS NOT NULL THEN
                        INSERT INTO public."QuotationProductVariable" ("quotationProductId", "masterVariableId", "value")
                        VALUES (v_qp_id, v_variable_id, COALESCE(v_var_parts[2], ''));
                    END IF;
                END LOOP;
            END IF;
        END LOOP;

        -- Calcular y actualizar el totalAmount basado en QuotationProductTax
        UPDATE public."Quotation"
        SET "totalAmount" = (
            SELECT COALESCE(SUM(qpt."explicitAmount"), 0) AS cargos_global
            FROM public."QuotationProductTax" qpt
            JOIN public."QuotationProduct" qp ON qpt."quotationProductId" = qp.id
            WHERE qp."quotationId" = v_quotation_id
        )
        WHERE id = v_quotation_id;
        
        v_imported_count := v_imported_count + 1;
    END LOOP;

    p_mensaje_resultado := 'SUCCESS: ' || v_imported_count || ' cotizaciones importadas. [' || RTRIM(v_created_ids, ',') || ']';

EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM || ' | ' || SQLSTATE;
END;
$$;



-- Archivo: spImpuestoActualizar.sql
CREATE OR REPLACE PROCEDURE public.spImpuestoActualizar(
    p_id INT,
    p_code TEXT,
    p_name TEXT,
    p_type TEXT,
    p_value_type TEXT,
    p_value DECIMAL,
    p_is_editable BOOLEAN,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public."ChargeAndTax" SET
        "code" = p_code,
        "name" = p_name,
        "type" = p_type,
        "valueType" = p_value_type,
        "value" = p_value,
        "isEditable" = p_is_editable
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Cargo/Impuesto actualizado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spImpuestoCrear.sql
CREATE OR REPLACE PROCEDURE public.spImpuestoCrear(
    p_code TEXT,
    p_name TEXT,
    p_type TEXT,
    p_value_type TEXT,
    p_value DECIMAL,
    p_is_editable BOOLEAN,
    p_acting_user_id INT,
    INOUT p_tax_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."ChargeAndTax" ("code", "name", "type", "valueType", "value", "isEditable")
    VALUES (p_code, p_name, p_type, p_value_type, p_value, p_is_editable)
    RETURNING id INTO p_tax_id;

    p_mensaje_resultado := 'SUCCESS: Cargo/Impuesto creado con ID ' || p_tax_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spImpuestoEliminar.sql
CREATE OR REPLACE PROCEDURE public.spImpuestoEliminar(
    p_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public."ChargeAndTax" WHERE id = p_id;
    p_mensaje_resultado := 'SUCCESS: Cargo eliminado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spLogListar.sql
-- sploglistar.sql
-- RUTA: c:\Proyectos\AgenciasNew\SQL\SP\spLogListar.sql

CREATE OR REPLACE FUNCTION public.sploglistar(
    p_limit INT DEFAULT 100,
    p_offset INT DEFAULT 0,
    p_module TEXT DEFAULT NULL,
    p_user_id INT DEFAULT NULL
)
RETURNS TABLE (
    id INT,
    "userId" INT,
    "userName" TEXT,
    "action" TEXT,
    "module" TEXT,
    "description" TEXT,
    "metadata" JSON,
    "createdAt" TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l."userId",
        u.name AS "userName",
        l.action AS "action",
        l.module AS "module",
        l.description AS "description",
        l.metadata::JSON AS "metadata",
        l."createdAt" AS "createdAt"
    FROM public."SystemLog" l
    LEFT JOIN public."User" u ON l."userId" = u.id
    WHERE (p_module IS NULL OR l.module = UPPER(p_module))
      AND (p_user_id IS NULL OR l."userId" = p_user_id)
    ORDER BY l."createdAt" DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


-- Archivo: spLogRegistrar.sql
CREATE OR REPLACE PROCEDURE public."spLogRegistrar"(
    p_user_id INT, 
    p_module TEXT, 
    p_action TEXT, 
    p_description TEXT, 
    p_metadata JSONB, 
    INOUT p_temp_id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."SystemLog" (
        "userId", "module", "action", "description", "metadata", "createdAt"
    ) VALUES (
        p_user_id, UPPER(p_module), UPPER(p_action), p_description, p_metadata, NOW()
    ) RETURNING id INTO p_temp_id;
END;
$$;

-- Archivo: spMaestroImportar.sql
CREATE OR REPLACE PROCEDURE public.spMaestroImportar(
    p_tipo TEXT,
    p_text_data TEXT, -- Delimited text (Rows by \n, Cols by ^)
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_row_text TEXT;
    v_cols TEXT[];
    v_count INT := 0;
    v_errors TEXT := '';
    v_branch_id INT;
    v_provider_id INT;
    v_role_id INT;
    v_hashed_password TEXT := '$2a$10$7zB.Y7S5y5y5y5y5y5y5y.y5y5y5y5y5y5y5y5y5y5y5y5y5y5y'; -- Placeholder hash
BEGIN
    FOR v_row_text IN SELECT unnest(string_to_array(p_text_data, E'\n')) LOOP
        IF TRIM(v_row_text) = '' THEN CONTINUE; END IF;
        
        BEGIN
            v_cols := string_to_array(v_row_text, '^');
            
            IF p_tipo = 'sucursales' THEN
                -- Format: code^name
                IF v_cols[1] IS NOT NULL AND v_cols[2] IS NOT NULL THEN
                    INSERT INTO public."Branch" ("code", "name")
                    VALUES (TRIM(v_cols[1]), TRIM(v_cols[2]))
                    ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name";
                    v_count := v_count + 1;
                END IF;

            ELSIF p_tipo = 'implants' THEN
                -- Format: code^name^branchCode
                IF v_cols[1] IS NOT NULL AND v_cols[2] IS NOT NULL THEN
                    v_branch_id := NULL;
                    IF v_cols[3] IS NOT NULL AND TRIM(v_cols[3]) <> '' THEN
                        SELECT id INTO v_branch_id FROM public."Branch" WHERE LOWER("code") = LOWER(TRIM(v_cols[3]));
                    END IF;
                    
                    INSERT INTO public."Implant" ("code", "name", "branchId")
                    VALUES (TRIM(v_cols[1]), TRIM(v_cols[2]), v_branch_id)
                    ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "branchId" = EXCLUDED."branchId";
                    v_count := v_count + 1;
                END IF;

            ELSIF p_tipo = 'vendedores' THEN
                -- Format: name^email^code
                IF v_cols[1] IS NOT NULL THEN
                    IF v_cols[3] IS NOT NULL AND TRIM(v_cols[3]) <> '' THEN
                        INSERT INTO public."Seller" ("code", "name", "email")
                        VALUES (TRIM(v_cols[3]), TRIM(v_cols[1]), NULLIF(TRIM(v_cols[2]), ''))
                        ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "email" = EXCLUDED."email";
                    ELSE
                        INSERT INTO public."Seller" ("name", "email") VALUES (TRIM(v_cols[1]), NULLIF(TRIM(v_cols[2]), ''));
                    END IF;
                    v_count := v_count + 1;
                END IF;

            ELSIF p_tipo = 'tiqueteadores' THEN
                -- Format: name^email^code
                IF v_cols[1] IS NOT NULL THEN
                    IF v_cols[3] IS NOT NULL AND TRIM(v_cols[3]) <> '' THEN
                        INSERT INTO public."TicketPrinter" ("code", "name", "email")
                        VALUES (TRIM(v_cols[3]), TRIM(v_cols[1]), NULLIF(TRIM(v_cols[2]), ''))
                        ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "email" = EXCLUDED."email";
                    ELSE
                        INSERT INTO public."TicketPrinter" ("name", "email") VALUES (TRIM(v_cols[1]), NULLIF(TRIM(v_cols[2]), ''));
                    END IF;
                    v_count := v_count + 1;
                END IF;

            ELSIF p_tipo = 'impuestos' THEN
                -- Format: code^name^type^valueType^value
                IF v_cols[2] IS NOT NULL AND v_cols[3] IS NOT NULL THEN
                    INSERT INTO public."ChargeAndTax" ("code", "name", "type", "valueType", "value", "isEditable", "inNationality")
                    VALUES (TRIM(v_cols[1]), TRIM(v_cols[2]), TRIM(v_cols[3]), TRIM(v_cols[4]), NULLIF(TRIM(v_cols[5]), '')::DECIMAL, TRUE, COALESCE(NULLIF(TRIM(v_cols[6]), '')::INT, 1))
                    ON CONFLICT ("code") DO UPDATE SET 
                        "name" = EXCLUDED."name",
                        "type" = EXCLUDED."type",
                        "valueType" = EXCLUDED."valueType",
                        "value" = EXCLUDED."value",
                        "inNationality" = EXCLUDED."inNationality";
                    v_count := v_count + 1;
                END IF;

            ELSIF p_tipo = 'clientes' THEN
                -- Format: document^name^contactInfo^address
                IF v_cols[1] IS NOT NULL AND v_cols[2] IS NOT NULL THEN
                    INSERT INTO public."Client" ("document", "name", "contactInfo", "address")
                    VALUES (TRIM(v_cols[1]), TRIM(v_cols[2]), TRIM(v_cols[3]), TRIM(v_cols[4]))
                    ON CONFLICT ("document") DO UPDATE SET 
                        "name" = EXCLUDED."name", 
                        "contactInfo" = EXCLUDED."contactInfo", 
                        "address" = EXCLUDED."address";
                    v_count := v_count + 1;
                END IF;

            ELSIF p_tipo = 'proveedores' THEN
                -- Format: name^contactInfo^code
                IF v_cols[1] IS NOT NULL THEN
                    IF v_cols[3] IS NOT NULL AND TRIM(v_cols[3]) <> '' THEN
                        INSERT INTO public."Provider" ("code", "name", "contactInfo")
                        VALUES (TRIM(v_cols[3]), TRIM(v_cols[1]), NULLIF(TRIM(v_cols[2]), ''))
                        ON CONFLICT ("code") DO UPDATE SET 
                            "name" = EXCLUDED."name", 
                            "contactInfo" = EXCLUDED."contactInfo";
                    ELSE
                        INSERT INTO public."Provider" ("name", "contactInfo") VALUES (TRIM(v_cols[1]), NULLIF(TRIM(v_cols[2]), ''));
                    END IF;
                    v_count := v_count + 1;
                END IF;

            ELSIF p_tipo = 'productos' THEN
                -- Format: description^basePrice^code^type^billingConcept^serviceType
                IF v_cols[1] IS NOT NULL THEN
                    IF v_cols[3] IS NOT NULL AND TRIM(v_cols[3]) <> '' THEN
                        INSERT INTO public."Product" ("code", "type", "description", "basePrice", "billingConcept", "serviceType")
                        VALUES (TRIM(v_cols[3]), COALESCE(TRIM(v_cols[4]), 'SERVICE'), TRIM(v_cols[1]), NULLIF(TRIM(v_cols[2]), '')::DECIMAL, TRIM(v_cols[5]), TRIM(v_cols[6]))
                        ON CONFLICT ("code") DO UPDATE SET 
                            "type" = EXCLUDED."type",
                            "description" = EXCLUDED."description",
                            "basePrice" = EXCLUDED."basePrice",
                            "billingConcept" = EXCLUDED."billingConcept",
                            "serviceType" = EXCLUDED."serviceType";
                    ELSE
                        INSERT INTO public."Product" ("type", "description", "basePrice", "billingConcept", "serviceType")
                        VALUES (COALESCE(TRIM(v_cols[4]), 'SERVICE'), TRIM(v_cols[1]), NULLIF(TRIM(v_cols[2]), '')::DECIMAL, TRIM(v_cols[5]), TRIM(v_cols[6]));
                    END IF;
                    v_count := v_count + 1;
                END IF;

            ELSIF p_tipo = 'prestadoras' THEN
                -- Format: name^providerNM^code^category^location^type
                IF v_cols[1] IS NOT NULL AND v_cols[2] IS NOT NULL THEN
                    SELECT id INTO v_provider_id FROM public."Provider" WHERE "name" ILIKE '%' || TRIM(v_cols[2]) || '%' LIMIT 1;
                    IF v_provider_id IS NOT NULL THEN
                        IF v_cols[3] IS NOT NULL AND TRIM(v_cols[3]) <> '' THEN
                            INSERT INTO public."Prestadora" ("code", "name", "category", "location", "providerId", "type")
                            VALUES (TRIM(v_cols[3]), TRIM(v_cols[1]), COALESCE(TRIM(v_cols[4]), '3*'), TRIM(v_cols[5]), v_provider_id, COALESCE(TRIM(v_cols[6]), 'HOTEL'))
                            ON CONFLICT ("code") DO UPDATE SET 
                                "name" = EXCLUDED."name",
                                "category" = EXCLUDED."category",
                                "location" = EXCLUDED."location",
                                "providerId" = EXCLUDED."providerId",
                                "type" = EXCLUDED."type";
                        ELSE
                            INSERT INTO public."Prestadora" ("name", "category", "location", "providerId", "type")
                            VALUES (TRIM(v_cols[1]), COALESCE(TRIM(v_cols[4]), '3*'), TRIM(v_cols[5]), v_provider_id, COALESCE(TRIM(v_cols[6]), 'HOTEL'));
                        END IF;
                        v_count := v_count + 1;
                    END IF;
                END IF;

            ELSIF p_tipo = 'variables' THEN
                -- Format: code^name
                IF v_cols[1] IS NOT NULL AND v_cols[2] IS NOT NULL THEN
                    INSERT INTO public."Variable" ("code", "name")
                    VALUES (TRIM(v_cols[1]), TRIM(v_cols[2]))
                    ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name";
                    v_count := v_count + 1;
                END IF;

            ELSIF p_tipo = 'parametros' THEN
                -- Format: code^name^value
                IF v_cols[1] IS NOT NULL AND v_cols[2] IS NOT NULL THEN
                    INSERT INTO public."SystemParameter" ("code", "name", "value")
                    VALUES (TRIM(v_cols[1]), TRIM(v_cols[2]), TRIM(v_cols[3]))
                    ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "value" = EXCLUDED."value";
                    v_count := v_count + 1;
                END IF;

            ELSIF p_tipo = 'usuarios' THEN
                -- Format: email^name^roleName^password
                IF v_cols[1] IS NOT NULL AND v_cols[2] IS NOT NULL THEN
                    SELECT id INTO v_role_id FROM public."Role" WHERE "name" ILIKE '%' || COALESCE(TRIM(v_cols[3]), 'Seller') || '%' LIMIT 1;
                    IF v_role_id IS NOT NULL THEN
                        INSERT INTO public."User" ("email", "name", "roleId", "passwordHash")
                        VALUES (TRIM(v_cols[1]), TRIM(v_cols[2]), v_role_id, v_hashed_password)
                        ON CONFLICT ("email") DO UPDATE SET 
                            "name" = EXCLUDED."name",
                            "roleId" = EXCLUDED."roleId";
                        v_count := v_count + 1;
                    END IF;
                END IF;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_errors := v_errors || 'Error en item: ' || SQLERRM || '; ';
        END;
    END LOOP;

    p_mensaje_resultado := 'SUCCESS: Procesados ' || v_count || ' registros. ' || CASE WHEN v_errors <> '' THEN 'Errores: ' || v_errors ELSE '' END;
END;
$$;


-- Archivo: spMonedaActualizar.sql
CREATE OR REPLACE PROCEDURE public.spMonedaActualizar(
    p_id            INT,
    p_code          TEXT,
    p_name          TEXT,
    p_exchange_rate FLOAT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public."Currency" WHERE id = p_id) THEN
        p_mensaje_resultado := 'ERROR: Moneda con ID ' || p_id || ' no encontrada';
        RETURN;
    END IF;

    -- Verificar que el nuevo código no esté en uso por otra moneda
    IF EXISTS (SELECT 1 FROM public."Currency" WHERE code = p_code AND id <> p_id) THEN
        p_mensaje_resultado := 'ERROR: El código ' || p_code || ' ya está en uso por otra moneda';
        RETURN;
    END IF;

    UPDATE public."Currency"
    SET
        code           = p_code,
        name           = p_name,
        "exchangeRate" = p_exchange_rate
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Moneda ' || p_id || ' actualizada correctamente';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spMonedaCrear.sql
CREATE OR REPLACE PROCEDURE public.spMonedaCrear(
    p_code         TEXT,
    p_name         TEXT,
    p_exchange_rate FLOAT,
    p_acting_user_id INT,
    INOUT p_currency_id      INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public."Currency" WHERE code = p_code) THEN
        p_mensaje_resultado := 'ERROR: El código de moneda ya está registrado';
        RETURN;
    END IF;

    INSERT INTO public."Currency" (code, name, "exchangeRate")
    VALUES (p_code, p_name, p_exchange_rate)
    RETURNING id INTO p_currency_id;

    p_mensaje_resultado := 'SUCCESS: Moneda creada con ID ' || p_currency_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spMonedaEliminar.sql
CREATE OR REPLACE PROCEDURE public.spMonedaEliminar(
    p_id              INT,
    p_acting_user_id  INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public."Currency" WHERE id = p_id) THEN
        p_mensaje_resultado := 'ERROR: Moneda con ID ' || p_id || ' no encontrada';
        RETURN;
    END IF;

    DELETE FROM public."Currency" WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Moneda ' || p_id || ' eliminada correctamente';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spMonedaListar.sql
CREATE OR REPLACE PROCEDURE public.spMonedaListar(
    p_id                  INT,       -- NULL = traer todas, valor = traer una específica
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Currency" WHERE id = p_id) THEN
        p_mensaje_resultado := 'ERROR: Moneda con ID ' || p_id || ' no encontrada';
        RETURN;
    END IF;

    -- Retorna el resultado como conjunto de filas usando RETURN QUERY no aplica en PROCEDURE;
    -- El cliente (API) debe ejecutar un SELECT directamente después de llamar este SP,
    -- o usar una función (fnMonedaListar) para retornar rows.
    -- Este SP valida existencia y devuelve el mensaje de estado.

    IF p_id IS NULL THEN
        p_mensaje_resultado := 'SUCCESS: Consulta de todas las monedas';
    ELSE
        p_mensaje_resultado := 'SUCCESS: Consulta de moneda ID ' || p_id;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spPrestadoraActualizar.sql
CREATE OR REPLACE PROCEDURE public.spPrestadoraActualizar(
    p_id INT,
    p_code TEXT,
    p_name TEXT,
    p_category TEXT,
    p_location TEXT,
    p_provider_id INT,
    p_type TEXT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public."Prestadora" SET
        "code" = p_code,
        "name" = p_name,
        "category" = p_category,
        "location" = p_location,
        "providerId" = p_provider_id,
        "type" = p_type
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Prestadora actualizado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spPrestadoraCrear.sql
CREATE OR REPLACE PROCEDURE public.spPrestadoraCrear(
    p_code TEXT,
    p_name TEXT,
    p_category TEXT,
    p_location TEXT,
    p_provider_id INT,
    p_type TEXT,
    p_acting_user_id INT,
    INOUT p_prestadora_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."Prestadora" ("code", "name", "category", "location", "providerId", "type")
    VALUES (p_code, p_name, p_category, p_location, p_provider_id, p_type)
    RETURNING id INTO p_prestadora_id;

    p_mensaje_resultado := 'SUCCESS: Prestadora creado con ID ' || p_prestadora_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spPrestadoraEliminar.sql
CREATE OR REPLACE PROCEDURE public.spPrestadoraEliminar(
    p_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public."Prestadora" WHERE id = p_id;
    p_mensaje_resultado := 'SUCCESS: Prestadora eliminado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spProductoActualizar.sql
CREATE OR REPLACE PROCEDURE public.spProductoActualizar(
    p_id INT,
    p_code TEXT,
    p_type TEXT,
    p_description TEXT,
    p_base_price FLOAT,
    p_cost FLOAT,
    p_billing_concept TEXT,
    p_service_type TEXT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public."Product" WHERE id = p_id) THEN
        p_mensaje_resultado := 'ERROR: Producto con ID ' || p_id || ' no encontrado';
        RETURN;
    END IF;

    UPDATE public."Product" SET
        "code" = p_code,
        "type" = p_type,
        "description" = p_description,
        "basePrice" = p_base_price,
        "cost" = p_cost,
        "billingConcept" = p_billing_concept,
        "serviceType" = p_service_type
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Producto actualizado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spProductoCrear.sql
CREATE OR REPLACE PROCEDURE public.spProductoCrear(
    p_code TEXT,
    p_type TEXT,
    p_description TEXT,
    p_base_price FLOAT,
    p_cost FLOAT,
    p_billing_concept TEXT,
    p_service_type TEXT,
    p_acting_user_id INT,
    INOUT p_product_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."Product" ("code", "type", "description", "basePrice", "cost", "billingConcept", "serviceType")
    VALUES (p_code, p_type, p_description, p_base_price, p_cost, p_billing_concept, p_service_type)
    RETURNING id INTO p_product_id;

    p_mensaje_resultado := 'SUCCESS: Producto creado con ID ' || p_product_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spProductoEliminar.sql
CREATE OR REPLACE PROCEDURE public.spProductoEliminar(
    p_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public."Product" WHERE id = p_id;
    p_mensaje_resultado := 'SUCCESS: Producto eliminado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spProveedorActualizar.sql
CREATE OR REPLACE PROCEDURE public.spProveedorActualizar(
    p_id INT,
    p_code TEXT,
    p_name TEXT,
    p_contact_info TEXT,
    p_commission_config JSONB,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public."Provider" SET
        "code" = p_code,
        "name" = p_name,
        "contactInfo" = p_contact_info,
        "commissionConfig" = p_commission_config
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Proveedor actualizado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spProveedorCrear.sql
CREATE OR REPLACE PROCEDURE public.spProveedorCrear(
    p_code TEXT,
    p_name TEXT,
    p_contact_info TEXT,
    p_commission_config JSONB,
    p_acting_user_id INT,
    INOUT p_provider_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."Provider" ("code", "name", "contactInfo", "commissionConfig")
    VALUES (p_code, p_name, p_contact_info, p_commission_config)
    RETURNING id INTO p_provider_id;

    p_mensaje_resultado := 'SUCCESS: Proveedor creado con ID ' || p_provider_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;


-- Archivo: spProveedorEliminar.sql
CREATE OR REPLACE PROCEDURE public.spProveedorEliminar(
    p_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public."Provider" WHERE id = p_id;
    p_mensaje_resultado := 'SUCCESS: Proveedor eliminado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;

-- Archivo: spCotizacionActualizarEstado.sql
CREATE OR REPLACE PROCEDURE public.spCotizacionActualizarEstado(
    p_response JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estados_str TEXT;
    v_item_text TEXT;
    v_id INT;
    v_estado TEXT;
    v_row_json JSONB;
BEGIN
    /**
     * Este procedimiento recibe la respuesta de SQL Server (spCotizacionesCrear)
     * Parsea UNICAMENTE el nodo 'Estados' que contiene el formato 'ID:Estado|ID:Estado|'
     */
    
    -- El input puede ser un array de objetos o un objeto individual
    -- Buscamos el campo 'Estados' en cada objeto
    IF JSONB_TYPEOF(p_response) = 'array' THEN
        FOR v_row_json IN SELECT jsonb_array_elements(p_response)
        LOOP
            v_estados_str := v_row_json->>'Estados';
            
            IF v_estados_str IS NOT NULL AND v_estados_str <> '' THEN
                -- Iterar sobre cada par ID:Estado separado por '|'
                FOR v_item_text IN SELECT unnest(string_to_array(btrim(v_estados_str, '|'), '|'))
                LOOP
                    v_item_text := trim(v_item_text);
                    IF v_item_text LIKE '%:%' THEN
                        BEGIN
                            -- Split por ':'
                            v_id := split_part(v_item_text, ':', 1)::INT;
                            v_estado := split_part(v_item_text, ':', 2);
                            
                            -- Actualizar con el estado LITERAL recibido
                            UPDATE public."Quotation"
                            SET "state" = v_estado
                            WHERE id = v_id;
                        EXCEPTION WHEN OTHERS THEN
                            -- Ignorar errores de casteo en items individuales
                        END;
                    END IF;
                END LOOP;
            END IF;
        END LOOP;
    ELSIF JSONB_TYPEOF(p_response) = 'object' THEN
        v_estados_str := p_response->>'Estados';
        IF v_estados_str IS NOT NULL AND v_estados_str <> '' THEN
            FOR v_item_text IN SELECT unnest(string_to_array(btrim(v_estados_str, '|'), '|'))
            LOOP
                v_item_text := trim(v_item_text);
                IF v_item_text LIKE '%:%' THEN
                    BEGIN
                        v_id := split_part(v_item_text, ':', 1)::INT;
                        v_estado := split_part(v_item_text, ':', 2);
                        
                        UPDATE public."Quotation"
                        SET "state" = v_estado
                        WHERE id = v_id;
                    EXCEPTION WHEN OTHERS THEN END;
                END IF;
            END LOOP;
        END IF;
    END IF;
END;
$$;



