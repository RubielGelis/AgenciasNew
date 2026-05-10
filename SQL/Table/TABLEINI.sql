do $$
BEGIN
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

	CREATE SEQUENCE IF NOT EXISTS public."GDS_id_seq"
		INCREMENT 1
		START 1
		MINVALUE 1
		MAXVALUE 2147483647
		CACHE 1;
	
	ALTER SEQUENCE public."GDS_id_seq"
	    OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."Interfaces_id_seq"
		INCREMENT 1
		START 1
		MINVALUE 1
		MAXVALUE 2147483647
		CACHE 1;
	
	ALTER SEQUENCE public."Interfaces_id_seq"
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
	    "state" varchar(25) DEFAULT 'NUEVO',
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
	ALTER TABLE public."QuotationProduct" ADD COLUMN IF NOT EXISTS "service" text;
	ALTER TABLE public."QuotationProduct" ADD COLUMN IF NOT EXISTS "description" text;
	ALTER TABLE public."Prestadora" ADD COLUMN IF NOT EXISTS "initials" text;
	ALTER TABLE public."Prestadora" ADD COLUMN IF NOT EXISTS "nogds" text;
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

	CREATE TABLE IF NOT EXISTS public."GDS"(
		id integer NOT NULL DEFAULT nextval('"GDS_id_seq"'::regclass),
		name text COLLATE pg_catalog."default" NOT NULL,
		CONSTRAINT "GDS_pkey" PRIMARY KEY (id)
	)	

	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."GDS" OWNER to postgres;
	
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GDS_pkey') THEN
		ALTER TABLE public."GDS" ADD CONSTRAINT "GDS_pkey" PRIMARY KEY (id);
	END IF;

	--DROP INDEX IF EXISTS public."gds_name_key";

	CREATE UNIQUE INDEX IF NOT EXISTS "gds_name_key"
	    ON public."GDS" USING btree
	    (name COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
    
	TABLESPACE pg_default;

	ALTER SEQUENCE public."GDS_id_seq"
	    OWNED BY public."GDS".id;	

	CREATE TABLE IF NOT EXISTS public."Interfaces"(
		id integer NOT NULL DEFAULT nextval('"Interfaces_id_seq"'::regclass),
		code text COLLATE pg_catalog."default" NOT NULL,
		name text COLLATE pg_catalog."default" NOT NULL,
		inactivo boolean NOT NULL DEFAULT false,
		bl_genera_archivoplano boolean NOT NULL DEFAULT false,
		ds_storedprocedure_archivoplano text COLLATE pg_catalog."default",
		bl_job boolean NOT NULL DEFAULT false,
		ds_nameJob text COLLATE pg_catalog."default",
		bl_facturador boolean NOT NULL DEFAULT false,
		id_GDS integer,
		CONSTRAINT "interfaces_pkey" PRIMARY KEY (id)
	)
	
	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Interfaces" OWNER to postgres;

	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'interfaces_pkey') THEN
		ALTER TABLE public."Interfaces" ADD CONSTRAINT "interfaces_pkey" PRIMARY KEY (id);
	END IF;

	-- DROP INDEX IF EXISTS public."interfaces_code_key";
	
	CREATE UNIQUE INDEX IF NOT EXISTS "interfaces_code_key"
	    ON public."Interfaces" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
    
	TABLESPACE pg_default;

	ALTER SEQUENCE public."Interfaces_id_seq"
	    OWNED BY public."Interfaces".id;

	CREATE SEQUENCE IF NOT EXISTS public."Master_id_seq"
		INCREMENT 1
		START 1
		MINVALUE 1
		MAXVALUE 2147483647
		CACHE 1;
	
	ALTER SEQUENCE public."Master_id_seq"
	    OWNER TO postgres;	

	CREATE TABLE IF NOT EXISTS public."Master"(
		id integer NOT NULL DEFAULT nextval('"Master_id_seq"'::regclass),
		code text COLLATE pg_catalog."default" NOT NULL,
		name text COLLATE pg_catalog."default" NOT NULL,
		inactivo boolean NOT NULL DEFAULT false,
		CONSTRAINT "master_pkey" PRIMARY KEY (id)
	)

	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."Master" OWNER to postgres;

	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'master_pkey') THEN
		ALTER TABLE public."Master" ADD CONSTRAINT "master_pkey" PRIMARY KEY (id);
	END IF;

	-- DROP INDEX IF EXISTS public."master_code_key";

	CREATE UNIQUE INDEX IF NOT EXISTS "master_code_key"
	    ON public."Master" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
    
	TABLESPACE pg_default;

	ALTER SEQUENCE public."Master_id_seq"
	    OWNED BY public."Master".id;


	CREATE SEQUENCE IF NOT EXISTS public."EquivalencesInterfaces_id_seq"
		INCREMENT 1
		START 1
		MINVALUE 1
		MAXVALUE 2147483647
		CACHE 1;
	
	ALTER SEQUENCE public."EquivalencesInterfaces_id_seq"
	    OWNER TO postgres;	

	CREATE TABLE IF NOT EXISTS public."EquivalencesInterfaces"(
		id integer NOT NULL DEFAULT nextval('"EquivalencesInterfaces_id_seq"'::regclass),
		id_interfaces integer NOT NULL,
		id_master integer NOT NULL,
		cd_maestro text COLLATE pg_catalog."default" NOT NULL,
		cd_codigo text COLLATE pg_catalog."default" NOT NULL,
		cd_codigoInte text COLLATE pg_catalog."default" NOT NULL,
		dt_fecha timestamp without time zone DEFAULT now(),
		CONSTRAINT "EquivalencesInterfaces_pkey" PRIMARY KEY (id),
	    CONSTRAINT "EquivalencesInterfaces_id_interfaces_fkey" FOREIGN KEY ("id_interfaces")
	        REFERENCES public."Interfaces" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE RESTRICT,
		CONSTRAINT "EquivalencesInterfaces_id_master_fkey" FOREIGN KEY ("id_master")
	        REFERENCES public."Master" (id) MATCH SIMPLE
	        ON UPDATE CASCADE
	        ON DELETE RESTRICT	
	)

	TABLESPACE pg_default;
	
	ALTER TABLE IF EXISTS public."EquivalencesInterfaces" OWNER to postgres;

	ALTER SEQUENCE public."EquivalencesInterfaces_id_seq"
		OWNED BY public."EquivalencesInterfaces".id;
<<<<<<< HEAD
	CREATE TABLE IF NOT EXISTS public."Report" (
	    id SERIAL PRIMARY KEY,
	    name VARCHAR(255) NOT NULL,
	    base_table VARCHAR(100), -- Puede ser NULL si es Custom SQL
	    description TEXT,
	    custom_sql TEXT, -- Para reportes definidos por script
	    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS public."ReportSorts" (
	    id SERIAL PRIMARY KEY,
	    report_id INTEGER NOT NULL REFERENCES public."Report"(id) ON DELETE CASCADE,
	    column_expr TEXT NOT NULL,
	    direction VARCHAR(10) DEFAULT 'ASC',
	    sort_order INTEGER DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS public."ReportJoins" (
	    id SERIAL PRIMARY KEY,
	    report_id INTEGER NOT NULL REFERENCES public."Report"(id) ON DELETE CASCADE,
	    table_name VARCHAR(100) NOT NULL,
	    alias VARCHAR(20) NOT NULL,
	    join_type VARCHAR(50) NOT NULL DEFAULT 'INNER JOIN',
	    join_condition TEXT NOT NULL,
	    sort_order INTEGER DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS public."ReportColumns" (
	    id SERIAL PRIMARY KEY,
	    report_id INTEGER NOT NULL REFERENCES public."Report"(id) ON DELETE CASCADE,
	    table_alias VARCHAR(20),
	    column_name VARCHAR(100) NOT NULL,
	    alias VARCHAR(150),
	    is_calculated BOOLEAN DEFAULT false,
	    is_visible BOOLEAN DEFAULT true,
	    formula_expression TEXT,
	    sort_order INTEGER DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS public."ReportFilters" (
	    id SERIAL PRIMARY KEY,
	    report_id INTEGER NOT NULL REFERENCES public."Report"(id) ON DELETE CASCADE,
	    table_alias VARCHAR(20),
	    column_name VARCHAR(100) NOT NULL,
	    filter_label VARCHAR(150),
	    filter_type VARCHAR(50) NOT NULL, -- 'text', 'date', 'number', 'select'
	    operator VARCHAR(20) DEFAULT '=',
	    sort_order INTEGER DEFAULT 0
	);
END	$$ 		
=======

	CREATE TABLE IF NOT EXISTS public."ReportSorts" (
	    id SERIAL PRIMARY KEY,
	    report_id INTEGER NOT NULL REFERENCES public."Report"(id) ON DELETE CASCADE,
	    column_expr TEXT NOT NULL,
	    direction VARCHAR(10) DEFAULT 'ASC',
	    sort_order INTEGER DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS public."ReportJoins" (
	    id SERIAL PRIMARY KEY,
	    report_id INTEGER NOT NULL REFERENCES public."Report"(id) ON DELETE CASCADE,
	    table_name VARCHAR(100) NOT NULL,
	    alias VARCHAR(20) NOT NULL,
	    join_type VARCHAR(50) NOT NULL DEFAULT 'INNER JOIN',
	    join_condition TEXT NOT NULL,
	    sort_order INTEGER DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS public."ReportColumns" (
	    id SERIAL PRIMARY KEY,
	    report_id INTEGER NOT NULL REFERENCES public."Report"(id) ON DELETE CASCADE,
	    table_alias VARCHAR(20),
	    column_name VARCHAR(100) NOT NULL,
	    alias VARCHAR(150),
	    is_calculated BOOLEAN DEFAULT false,
	    is_visible BOOLEAN DEFAULT true,
	    formula_expression TEXT,
	    sort_order INTEGER DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS public."ReportFilters" (
	    id SERIAL PRIMARY KEY,
	    report_id INTEGER NOT NULL REFERENCES public."Report"(id) ON DELETE CASCADE,
	    table_alias VARCHAR(20),
	    column_name VARCHAR(100) NOT NULL,
	    filter_label VARCHAR(150),
	    filter_type VARCHAR(50) NOT NULL, -- 'text', 'date', 'number', 'select'
	    operator VARCHAR(20) DEFAULT '=',
	    sort_order INTEGER DEFAULT 0
	);	

	-- SEQUENCES FOR BOOKING GDS
	CREATE SEQUENCE IF NOT EXISTS public."BookingGDS_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
	ALTER SEQUENCE public."BookingGDS_id_seq" OWNER TO postgres;
	
	CREATE SEQUENCE IF NOT EXISTS public."BookingProductGDS_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
	ALTER SEQUENCE public."BookingProductGDS_id_seq" OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."BookingProductTaxGDS_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
	ALTER SEQUENCE public."BookingProductTaxGDS_id_seq" OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."BookingProductPassangerGDS_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
	ALTER SEQUENCE public."BookingProductPassangerGDS_id_seq" OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."BookingProductVariableGDS_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
	ALTER SEQUENCE public."BookingProductVariableGDS_id_seq" OWNER TO postgres;

	CREATE SEQUENCE IF NOT EXISTS public."BookingProductPaymentGDS_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
	ALTER SEQUENCE public."BookingProductPaymentGDS_id_seq" OWNER TO postgres;

	-- TABLES FOR BOOKING GDS
	CREATE TABLE IF NOT EXISTS public."BookingGDS" (
		id integer NOT NULL DEFAULT nextval('"BookingGDS_id_seq"'::regclass),
		code VARCHAR(25) NOT NULL,
		type VARCHAR(25) NOT NULL,
		"blanch" VARCHAR(25) NOT NULL,
		"implant" VARCHAR(25) NULL,
		"external" boolean NOT NULL DEFAULT false,
		"gds" integer,
		"date" timestamp without time zone DEFAULT now(),
		"currency" text COLLATE pg_catalog."default" NOT NULL,
	    "exchangeRate" double precision NOT NULL,
		"tiquetPrinter" VARCHAR(25) NOT NULL,
		"seller" VARCHAR(25) NOT NULL,
		"client" VARCHAR(25) NOT NULL,
		"booking" text NULL,
		"typetransaction" VARCHAR(25),
		"iata" VARCHAR(25),
		"description" text,
		"observation" text,
		"state" VARCHAR(25),
		CONSTRAINT "BookingGDS_pkey" PRIMARY KEY (id)
	) TABLESPACE pg_default;
	ALTER TABLE IF EXISTS public."BookingGDS" OWNER to postgres;
	ALTER SEQUENCE public."BookingGDS_id_seq" OWNED BY public."BookingGDS".id;

	CREATE UNIQUE INDEX IF NOT EXISTS "bookingds_code_key"
	    ON public."BookingGDS" USING btree
	    (code COLLATE pg_catalog."default" ASC NULLS LAST)
	    WITH (fillfactor=100, deduplicate_items=True)
	TABLESPACE pg_default;	

	CREATE TABLE IF NOT EXISTS public."BookingProductGDS" (
		id integer NOT NULL DEFAULT nextval('"BookingProductGDS_id_seq"'::regclass),
		"bookingId" integer NOT NULL,
		code VARCHAR(25) NOT NULL,
		type VARCHAR(25),
		"service" text COLLATE pg_catalog."default",
		"description" text COLLATE pg_catalog."default",
		"prestadoracode" VARCHAR(25),
		"prestadorainitials" VARCHAR(25),
		"prestadoradist" VARCHAR(25),
		"provider" VARCHAR(25),
		"quantity" integer NOT NULL,
	    price double precision NOT NULL,
	    cost double precision DEFAULT 0,
		"checkInDate" timestamp(3) without time zone,
	    "checkOutDate" timestamp(3) without time zone,
	    "nights" integer,
	    "paxAdults" integer,
	    "paxChildren" integer,
	    "serviceType" text COLLATE pg_catalog."default",
		"billingConcept" text COLLATE pg_catalog."default",
	    "destination" text COLLATE pg_catalog."default",
	    "reservationCode" text COLLATE pg_catalog."default",
	    "sellerCom" double precision,
	    "ticketPrinterCom" double precision,
	    "inNationality" integer DEFAULT 1,
		"state" VARCHAR(25) DEFAULT 'NUEVO',
		CONSTRAINT "BookingProductGDS_pkey" PRIMARY KEY (id),
		CONSTRAINT "BookingProductGDS_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."BookingGDS" (id) ON UPDATE CASCADE ON DELETE CASCADE
	) TABLESPACE pg_default;
	ALTER TABLE IF EXISTS public."BookingProductGDS" OWNER to postgres;
	ALTER SEQUENCE public."BookingProductGDS_id_seq" OWNED BY public."BookingProductGDS".id;

	CREATE TABLE IF NOT EXISTS public."BookingProductTaxGDS" (
		id integer NOT NULL DEFAULT nextval('"BookingProductTaxGDS_id_seq"'::regclass),
		"bookingProductId" integer NOT NULL,
		code VARCHAR(25) NOT NULL,
		name VARCHAR(50) NOT NULL,
		type VARCHAR(25) NOT NULL,
		"ismain" boolean DEFAULT false,
		"percentage" double precision NOT NULL,
		"amount" double precision NOT NULL, 
		CONSTRAINT "BookingProductTaxGDS_pkey" PRIMARY KEY (id),
		CONSTRAINT "BookingProductTaxGDS_bookingProductId_fkey" FOREIGN KEY ("bookingProductId") REFERENCES public."BookingProductGDS" (id) ON UPDATE CASCADE ON DELETE CASCADE
	) TABLESPACE pg_default;
	ALTER TABLE IF EXISTS public."BookingProductTaxGDS" OWNER to postgres;
	ALTER SEQUENCE public."BookingProductTaxGDS_id_seq" OWNED BY public."BookingProductTaxGDS".id;

	CREATE TABLE IF NOT EXISTS public."BookingProductPassangerGDS" (
		id integer NOT NULL DEFAULT nextval('"BookingProductPassangerGDS_id_seq"'::regclass),
		"bookingProductId" integer NOT NULL,
		code VARCHAR(25),
		"firstnm" VARCHAR(30),
		"lastnm" VARCHAR(30),
		"prefix" VARCHAR(25),
		"identification" VARCHAR(25),
		"phone" VARCHAR(25),
		"email" VARCHAR(250),
		CONSTRAINT "BookingProductPassangerGDS_pkey" PRIMARY KEY (id),
		CONSTRAINT "BookingProductPassangerGDS_bookingProductId_fkey" FOREIGN KEY ("bookingProductId") REFERENCES public."BookingProductGDS" (id) ON UPDATE CASCADE ON DELETE CASCADE
	) TABLESPACE pg_default;
	ALTER TABLE IF EXISTS public."BookingProductPassangerGDS" OWNER to postgres;
	ALTER SEQUENCE public."BookingProductPassangerGDS_id_seq" OWNED BY public."BookingProductPassangerGDS".id;

	CREATE TABLE IF NOT EXISTS public."BookingProductVariableGDS" (
		id integer NOT NULL DEFAULT nextval('"BookingProductVariableGDS_id_seq"'::regclass),
		"bookingProductId" integer NOT NULL,
		code text COLLATE pg_catalog."default",
		name text COLLATE pg_catalog."default",
		"value" text COLLATE pg_catalog."default",
		CONSTRAINT "BookingProductVariableGDS_pkey" PRIMARY KEY (id),
		CONSTRAINT "BookingProductVariableGDS_bookingProductId_fkey" FOREIGN KEY ("bookingProductId") REFERENCES public."BookingProductGDS" (id) ON UPDATE CASCADE ON DELETE CASCADE
	) TABLESPACE pg_default;
	ALTER TABLE IF EXISTS public."BookingProductVariableGDS" OWNER to postgres;
	ALTER SEQUENCE public."BookingProductVariableGDS_id_seq" OWNED BY public."BookingProductVariableGDS".id;

	CREATE SEQUENCE IF NOT EXISTS public."BookingProductFEEGDS_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
	ALTER SEQUENCE public."BookingProductFEEGDS_id_seq" OWNER TO postgres;

	CREATE TABLE IF NOT EXISTS public."BookingProductFEEGDS" (
		id integer NOT NULL DEFAULT nextval('"BookingProductFEEGDS_id_seq"'::regclass),
		"bookingProductId" integer NOT NULL,
		code text COLLATE pg_catalog."default" NOT NULL,
		name text COLLATE pg_catalog."default" NOT NULL,
		type text COLLATE pg_catalog."default" NOT NULL,
		"description" text COLLATE pg_catalog."default" NOT NULL,
		"billigconcept" text COLLATE pg_catalog."default" NOT NULL,
		"servicetype" text COLLATE pg_catalog."default" NOT NULL,
		"amount" double precision NOT NULL,
		"tax" double precision NOT NULL,
		"other" double precision NOT NULL,
		"total" double precision NOT NULL,
		CONSTRAINT "BookingProductFEEGDS_pkey" PRIMARY KEY (id),
		CONSTRAINT "BookingProductFEEGDS_bookingProductId_fkey" FOREIGN KEY ("bookingProductId") REFERENCES public."BookingProductGDS" (id) ON UPDATE CASCADE ON DELETE CASCADE
	) TABLESPACE pg_default;
	ALTER TABLE IF EXISTS public."BookingProductFEEGDS" OWNER to postgres;
	ALTER SEQUENCE public."BookingProductFEEGDS_id_seq" OWNED BY public."BookingProductFEEGDS".id;


	CREATE TABLE IF NOT EXISTS public."BookingProductPaymentGDS" (
		id integer NOT NULL DEFAULT nextval('"BookingProductPaymentGDS_id_seq"'::regclass),
		"bookingProductId" integer NULL,
		"bookingProductFEEId" integer NULL,
		code VARCHAR(50) NOT NULL,
		name VARCHAR(50) NOT NULL,
		type VARCHAR(50) NOT NULL,
		"typecreditcard" VARCHAR(25),
		"numbercreditcard" VARCHAR(16),
		"vouchercreditcard" VARCHAR(25),
		"expiredcreditcard" VARCHAR(5),
		"authcreditcard" VARCHAR(25),
		"quotas" integer,
		"bank" VARCHAR(25),
		"square" VARCHAR(30),
		"reference" VARCHAR(50),
		"policy" VARCHAR(25),
		"policyannex" VARCHAR(25),
		"amount" double precision NOT NULL, 
		CONSTRAINT "BookingProductPaymentGDS_pkey" PRIMARY KEY (id),
		CONSTRAINT "BookingProductPaymentGDS_bookingProductId_fkey" FOREIGN KEY ("bookingProductId") REFERENCES public."BookingProductGDS" (id) ON UPDATE CASCADE ON DELETE CASCADE,
		CONSTRAINT "BookingProductPaymentGDS_bookingProductFEEId_fkey" FOREIGN KEY ("bookingProductFEEId") REFERENCES public."BookingProductFEEGDS" (id) ON UPDATE CASCADE ON DELETE CASCADE
	) TABLESPACE pg_default;
	ALTER TABLE IF EXISTS public."BookingProductPaymentGDS" OWNER to postgres;
	ALTER SEQUENCE public."BookingProductPaymentGDS_id_seq" OWNED BY public."BookingProductPaymentGDS".id;

	
	CREATE SEQUENCE IF NOT EXISTS public."BookingProductItineraryGDS_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
	ALTER SEQUENCE public."BookingProductItineraryGDS_id_seq" OWNER TO postgres;

	CREATE TABLE IF NOT EXISTS public."BookingProductItineraryGDS" (
		id integer NOT NULL DEFAULT nextval('"BookingProductItineraryGDS_id_seq"'::regclass),
		"bookingProductId" integer NOT NULL,
		"orden" integer,
		"origin" text COLLATE pg_catalog."default" NOT NULL,
		"destination" text COLLATE pg_catalog."default" NOT NULL,
		"class" text COLLATE pg_catalog."default" NOT NULL,
		"checkInDate" timestamp(3) without time zone,
		"checkOutDate" timestamp(3) without time zone,
		"terminal" text COLLATE pg_catalog."default" NOT NULL,
		"prestadoraCode" text COLLATE pg_catalog."default" NOT NULL,
		"farebasis" text COLLATE pg_catalog."default" NOT NULL,
		"Numflight" VARCHAR(25),
		"Typeflight" VARCHAR(1),
		"amount" double precision NOT NULL,
		CONSTRAINT "BookingProductItineraryGDS_pkey" PRIMARY KEY (id),
		CONSTRAINT "BookingProductItineraryGDS_bookingProductId_fkey" FOREIGN KEY ("bookingProductId") REFERENCES public."BookingProductGDS" (id) ON UPDATE CASCADE ON DELETE CASCADE
	) TABLESPACE pg_default;
	ALTER TABLE IF EXISTS public."BookingProductItineraryGDS" OWNER to postgres;
	ALTER SEQUENCE public."BookingProductItineraryGDS_id_seq" OWNED BY public."BookingProductItineraryGDS".id;

	CREATE SEQUENCE IF NOT EXISTS public."Payment_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
	ALTER SEQUENCE public."Payment_id_seq" OWNER TO postgres;

	CREATE TABLE IF NOT EXISTS public."Payment"
	(
	    id integer NOT NULL DEFAULT nextval('"Payment_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default" NOT NULL,
	    "name" text COLLATE pg_catalog."default" NOT NULL,
	    "inactive" boolean NOT NULL DEFAULT false,
	    "iscash" boolean NOT NULL DEFAULT false,
		"iscredit" boolean NOT NULL DEFAULT false,
	    CONSTRAINT "Payment_pkey" PRIMARY KEY (id)
	) TABLESPACE pg_default;
	ALTER TABLE IF EXISTS public."Payment" OWNER to postgres;
	CREATE UNIQUE INDEX IF NOT EXISTS "Payment_code_key" ON public."Payment" USING btree (code COLLATE pg_catalog."default" ASC NULLS LAST) WITH (fillfactor=100, deduplicate_items=True) TABLESPACE pg_default;
	ALTER SEQUENCE public."Payment_id_seq" OWNED BY public."Payment".id;

	CREATE SEQUENCE IF NOT EXISTS public."CreditCard_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
	ALTER SEQUENCE public."CreditCard_id_seq" OWNER TO postgres;

	CREATE TABLE IF NOT EXISTS public."CreditCard"
	(
	    id integer NOT NULL DEFAULT nextval('"CreditCard_id_seq"'::regclass),
	    code text COLLATE pg_catalog."default" NOT NULL,
	    "name" text COLLATE pg_catalog."default" NOT NULL,
		"type" text COLLATE pg_catalog."default" NOT NULL,
	    "inactive" boolean NOT NULL DEFAULT false,
	    CONSTRAINT "CreditCard_pkey" PRIMARY KEY (id)
	) TABLESPACE pg_default;
	ALTER TABLE IF EXISTS public."CreditCard" OWNER to postgres;
	CREATE UNIQUE INDEX IF NOT EXISTS "CreditCard_code_key" ON public."CreditCard" USING btree (code COLLATE pg_catalog."default" ASC NULLS LAST) WITH (fillfactor=100, deduplicate_items=True) TABLESPACE pg_default;
	ALTER SEQUENCE public."CreditCard_id_seq" OWNED BY public."CreditCard".id;

END	$$

