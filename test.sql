-- SQLBook: Code
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.address
(
    ad_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    title character varying(255) COLLATE pg_catalog."default",
    ad_pk_uuid uuid NOT NULL,
    CONSTRAINT address_pkey PRIMARY KEY (ad_pk_uuid)
);

CREATE TABLE IF NOT EXISTS public.cofunders
(
    cof_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT cofunders_pkey PRIMARY KEY (cof_pk_id)
);

CREATE TABLE IF NOT EXISTS public.departments
(
    dep_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT departments_pkey PRIMARY KEY (dep_pk_id)
);

CREATE TABLE IF NOT EXISTS public.educationlevels
(
    ecl_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    title character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT educationlevels_pkey PRIMARY KEY (ecl_pk_id)
);

CREATE TABLE IF NOT EXISTS public.file_uploads
(
    fu_id uuid NOT NULL DEFAULT gen_random_uuid(),
    fu_name character varying(255) COLLATE pg_catalog."default",
    fu_path character varying(255) COLLATE pg_catalog."default",
    fu_ext character varying(50) COLLATE pg_catalog."default",
    fu_mime character varying(100) COLLATE pg_catalog."default",
    fu_size bigint,
    create_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    update_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    url character varying(255) COLLATE pg_catalog."default",
    pivot_id integer,
    CONSTRAINT file_uploads_pkey PRIMARY KEY (fu_id)
);

CREATE TABLE IF NOT EXISTS public.findingdetaillists
(
    fdl_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    title character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT findingdetaillists_pkey PRIMARY KEY (fdl_pk_id)
);

CREATE TABLE IF NOT EXISTS public.form_allocate
(
    allocate_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    form_allocate_id integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    allocate_code character varying(255) COLLATE pg_catalog."default",
    form_utilization_id integer,
    report_title_th character varying(255) COLLATE pg_catalog."default",
    create_by integer,
    CONSTRAINT form_allocate_pkey PRIMARY KEY (allocate_pk_id)
);

CREATE TABLE IF NOT EXISTS public.form_extend
(
    extend_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    form_extend_id integer,
    extend_status character varying(255) COLLATE pg_catalog."default",
    extend_code character varying(255) COLLATE pg_catalog."default",
    form_own_id integer,
    extend_check_status character varying(255) COLLATE pg_catalog."default",
    extend_start_date timestamp with time zone,
    extend_end_date timestamp with time zone,
    form_new_id integer,
    report_code character varying(255) COLLATE pg_catalog."default",
    report_title_th character varying(255) COLLATE pg_catalog."default",
    create_by integer,
    CONSTRAINT form_extend_pkey PRIMARY KEY (extend_pk_id),
    CONSTRAINT uq_form_extend_new_id UNIQUE (form_new_id),
    CONSTRAINT uq_form_extend_own_id UNIQUE (form_own_id)
);

CREATE TABLE IF NOT EXISTS public.form_new_findings
(
    findings_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    form_new_id integer,
    report_code character varying(255) COLLATE pg_catalog."default",
    report_title_th character varying(255) COLLATE pg_catalog."default",
    report_title_en character varying(255) COLLATE pg_catalog."default",
    createby integer,
    form_status_id integer,
    sla_at timestamp with time zone,
    sla_by integer,
    status character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT form_new_findings_pkey PRIMARY KEY (findings_pk_id)
);

CREATE TABLE IF NOT EXISTS public.form_research_owner
(
    owner_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    form_own_id integer,
    form_own_code character varying(255) COLLATE pg_catalog."default",
    form_own_form_id integer,
    form_own_prefix integer,
    form_own_fullname character varying(255) COLLATE pg_catalog."default",
    form_own_lastname character varying(255) COLLATE pg_catalog."default",
    form_own_co_owner character varying(255) COLLATE pg_catalog."default",
    form_own_co_owner_type character varying(255) COLLATE pg_catalog."default",
    form_own_ownertype character varying(255) COLLATE pg_catalog."default",
    form_own_co_prefix integer,
    form_own_co_name character varying(255) COLLATE pg_catalog."default",
    form_own_co_lastname character varying(255) COLLATE pg_catalog."default",
    form_own_co_idcard_no character varying(255) COLLATE pg_catalog."default",
    form_own_co_department character varying(255) COLLATE pg_catalog."default",
    form_own_co_position character varying(255) COLLATE pg_catalog."default",
    form_own_co_tel character varying(255) COLLATE pg_catalog."default",
    form_own_co_mail character varying(255) COLLATE pg_catalog."default",
    form_own_status character varying(255) COLLATE pg_catalog."default",
    form_own_checked_by integer,
    form_own_checked_date timestamp with time zone,
    form_own_date_approve timestamp with time zone,
    form_own_form_plan_id integer,
    is_ownership boolean,
    form_own_create_by integer,
    form_own_created_at timestamp with time zone,
    form_own_update_by integer,
    form_own_updated_at timestamp with time zone,
    form_own_deleted_at timestamp with time zone,
    form_new_id integer,
    form_own_form_name character varying(255) COLLATE pg_catalog."default",
    status character varying(255) COLLATE pg_catalog."default",
    fullname character varying(255) COLLATE pg_catalog."default",
    form_owner_name character varying(255) COLLATE pg_catalog."default",
    form_own_department character varying(255) COLLATE pg_catalog."default",
    is_ownership_status character varying(255) COLLATE pg_catalog."default",
    objective text COLLATE pg_catalog."default",
    period character varying(255) COLLATE pg_catalog."default",
    file_uploads_plan integer,
    file_uploads_contract integer,
    file_uploads_other integer,
    CONSTRAINT form_research_owner_pkey PRIMARY KEY (owner_pk_id),
    CONSTRAINT uq_research_owner_form_new_id UNIQUE (form_new_id)
);

CREATE TABLE IF NOT EXISTS public.form_research_plan
(
    plan_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    form_plan_id integer,
    form_plan_form_new_id integer,
    form_plan_code character varying(255) COLLATE pg_catalog."default",
    form_plan_fullname character varying(255) COLLATE pg_catalog."default",
    form_plan_lastname character varying(255) COLLATE pg_catalog."default",
    form_plan_prefix integer,
    form_plan_idcard character varying(255) COLLATE pg_catalog."default",
    form_plan_department character varying(255) COLLATE pg_catalog."default",
    form_plan_position character varying(255) COLLATE pg_catalog."default",
    form_plan_tel character varying(255) COLLATE pg_catalog."default",
    form_plan_email character varying(255) COLLATE pg_catalog."default",
    form_plan_type_status character varying(255) COLLATE pg_catalog."default",
    form_plan_type_status_other character varying(255) COLLATE pg_catalog."default",
    form_plan_period integer,
    form_plan_start_date timestamp with time zone,
    form_plan_usage_value numeric(18, 2),
    form_plan_target text COLLATE pg_catalog."default",
    form_plan_target_check character varying(255) COLLATE pg_catalog."default",
    form_plan_target_other character varying(255) COLLATE pg_catalog."default",
    form_plan_user_target character varying(255) COLLATE pg_catalog."default",
    form_plan_result text COLLATE pg_catalog."default",
    form_plan_result_check character varying(255) COLLATE pg_catalog."default",
    form_plan_result_other character varying(255) COLLATE pg_catalog."default",
    form_plan_user_result character varying(255) COLLATE pg_catalog."default",
    form_plan_status character varying(255) COLLATE pg_catalog."default",
    form_plan_checked_by integer,
    form_plan_checked_date timestamp with time zone,
    form_plan_form_own_id integer,
    form_plan_form_plan_id integer,
    form_plan_type character varying(255) COLLATE pg_catalog."default",
    form_plan_reason text COLLATE pg_catalog."default",
    form_plan_condition integer,
    form_plan_create_by integer,
    form_plan_created_at timestamp with time zone,
    form_plan_update_by integer,
    form_plan_updated_at timestamp with time zone,
    form_plan_deleted_at timestamp with time zone,
    fullname character varying(255) COLLATE pg_catalog."default",
    objective text COLLATE pg_catalog."default",
    period character varying(255) COLLATE pg_catalog."default",
    file_uploads integer,
    CONSTRAINT form_research_plan_pkey PRIMARY KEY (plan_pk_id),
    CONSTRAINT uq_research_plan_form_new UNIQUE (form_plan_form_new_id),
    CONSTRAINT uq_research_plan_plan_id UNIQUE (form_plan_id)
);

CREATE TABLE IF NOT EXISTS public.form_utilization
(
    utilization_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    form_utilization_id integer,
    form_new_id integer,
    form_own_id integer,
    form_plan_id integer,
    is_type character varying(255) COLLATE pg_catalog."default",
    is_uti_type character varying(255) COLLATE pg_catalog."default",
    utilization_code character varying(255) COLLATE pg_catalog."default",
    utilization_no character varying(255) COLLATE pg_catalog."default",
    utilization_fullname character varying(255) COLLATE pg_catalog."default",
    current_status character varying(255) COLLATE pg_catalog."default",
    current_other character varying(255) COLLATE pg_catalog."default",
    is_use character varying(255) COLLATE pg_catalog."default",
    objective character varying(255) COLLATE pg_catalog."default",
    utilization_type character varying(255) COLLATE pg_catalog."default",
    utilization_other character varying(255) COLLATE pg_catalog."default",
    utilization_type_detail1 character varying(255) COLLATE pg_catalog."default",
    utilization_type_detail2 character varying(255) COLLATE pg_catalog."default",
    kind_of_use character varying(255) COLLATE pg_catalog."default",
    kind_of_use_other character varying(255) COLLATE pg_catalog."default",
    kind_of_use_other2 character varying(255) COLLATE pg_catalog."default",
    kind_of_use_other3 character varying(255) COLLATE pg_catalog."default",
    utilization_period character varying(255) COLLATE pg_catalog."default",
    start_date timestamp with time zone,
    utilization_detail text COLLATE pg_catalog."default",
    protection character varying(255) COLLATE pg_catalog."default",
    protection_other character varying(255) COLLATE pg_catalog."default",
    utilization_amount numeric(18, 2),
    utilization_amount_type character varying(255) COLLATE pg_catalog."default",
    utilization_amount_type_other character varying(255) COLLATE pg_catalog."default",
    utilization_amount_more numeric(18, 2),
    utilization_amount_type_more character varying(255) COLLATE pg_catalog."default",
    utilization_amount_type_other_more character varying(255) COLLATE pg_catalog."default",
    utilization_remark text COLLATE pg_catalog."default",
    utilization_money numeric(18, 2),
    utilization_money2 numeric(18, 2),
    utilization_money3 numeric(18, 2),
    utilization_money4 numeric(18, 2),
    utilization_remark2 text COLLATE pg_catalog."default",
    utilization_sum1 numeric(18, 2),
    utilization_sum2 numeric(18, 2),
    utilization_data text COLLATE pg_catalog."default",
    utilization_status character varying(255) COLLATE pg_catalog."default",
    utilization_success character varying(255) COLLATE pg_catalog."default",
    is_income character varying(255) COLLATE pg_catalog."default",
    is_status character varying(255) COLLATE pg_catalog."default",
    allocate_income_type character varying(255) COLLATE pg_catalog."default",
    utilization_condition text COLLATE pg_catalog."default",
    utilization_checked_by integer,
    utilization_checked_date timestamp with time zone,
    CONSTRAINT form_utilization_pkey PRIMARY KEY (utilization_pk_id),
    CONSTRAINT uq_utilization_id UNIQUE (form_utilization_id),
    CONSTRAINT uq_utilization_new UNIQUE (form_new_id),
    CONSTRAINT uq_utilization_own UNIQUE (form_own_id),
    CONSTRAINT uq_utilization_plan UNIQUE (form_plan_id)
);

CREATE TABLE IF NOT EXISTS public.funder
(
    fun_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    title character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT funder_pkey PRIMARY KEY (fun_pk_id)
);

CREATE TABLE IF NOT EXISTS public.groupstudies
(
    group_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    title character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT groupstudies_pkey PRIMARY KEY (group_pk_id)
);

CREATE TABLE IF NOT EXISTS public.mainstudies
(
    main_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    title character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT mainstudies_pkey PRIMARY KEY (main_pk_id)
);

CREATE TABLE IF NOT EXISTS public.pivot
(
    pivot_id uuid NOT NULL DEFAULT gen_random_uuid(),
    uploadable_id integer,
    uploadable_type character varying(255) COLLATE pg_catalog."default",
    fu_id integer,
    CONSTRAINT pivot_pkey PRIMARY KEY (pivot_id)
);

CREATE TABLE IF NOT EXISTS public.prefixs
(
    prefixs_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    prefix_name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT prefixs_pkey PRIMARY KEY (prefixs_pk_id),
    CONSTRAINT uq_prefixs_id UNIQUE (id)
);

CREATE TABLE IF NOT EXISTS public.psu_roles
(
    roles_id uuid NOT NULL DEFAULT gen_random_uuid(),
    roles_name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT psu_roles_pkey PRIMARY KEY (roles_id)
);

CREATE TABLE IF NOT EXISTS public.psu_user_login
(
    user_id uuid NOT NULL DEFAULT gen_random_uuid(),
    username character varying(255) COLLATE pg_catalog."default",
    token text COLLATE pg_catalog."default",
    "createdAt" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    "updateAt" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    roles_id integer,
    CONSTRAINT psu_user_login_pkey PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS public.researcher
(
    res_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id integer,
    email character varying(255) COLLATE pg_catalog."default",
    card_id character varying(50) COLLATE pg_catalog."default",
    default_role_id integer,
    department_id integer,
    fullname character varying(255) COLLATE pg_catalog."default",
    department_name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT researcher_pkey PRIMARY KEY (res_pk_id)
);

CREATE TABLE IF NOT EXISTS public.roles
(
    roles_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    name_th character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT roles_pkey PRIMARY KEY (roles_pk_id)
);

CREATE TABLE IF NOT EXISTS public.session
(
    session_id uuid NOT NULL DEFAULT gen_random_uuid(),
    username text COLLATE pg_catalog."default",
    token text COLLATE pg_catalog."default",
    "createdAt" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" timestamp(6) without time zone,
    roles_id integer,
    CONSTRAINT session_pkey PRIMARY KEY (session_id)
);

CREATE TABLE IF NOT EXISTS public.substudies
(
    sub_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    title character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT substudies_pkey PRIMARY KEY (sub_pk_id)
);

CREATE TABLE IF NOT EXISTS public.target_audiences
(
    target_aud_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    title character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT target_audiences_pkey PRIMARY KEY (target_aud_pk_id)
);

CREATE TABLE IF NOT EXISTS public.time_settings
(
    ts_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    id integer,
    title character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT time_settings_pkey PRIMARY KEY (ts_pk_id)
);

CREATE TABLE IF NOT EXISTS public.users
(
    user_pk_id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id integer,
    email character varying(255) COLLATE pg_catalog."default",
    card_id character varying(50) COLLATE pg_catalog."default",
    default_role_id integer,
    fullname character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (user_pk_id),
    CONSTRAINT users_user_id_key UNIQUE (user_id)
);

ALTER TABLE IF EXISTS public.file_uploads
    ADD CONSTRAINT fk_fileuploads_pivot FOREIGN KEY (pivot_id)
    REFERENCES public.pivot (pivot_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.form_allocate
    ADD CONSTRAINT fk_allocate_utilization FOREIGN KEY (form_utilization_id)
    REFERENCES public.form_utilization (form_utilization_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.form_research_owner
    ADD CONSTRAINT fk_owner_co_prefix FOREIGN KEY (form_own_co_prefix)
    REFERENCES public.prefixs (id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.form_research_owner
    ADD CONSTRAINT fk_owner_contract_fu FOREIGN KEY (file_uploads_contract)
    REFERENCES public.file_uploads (fu_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.form_research_owner
    ADD CONSTRAINT fk_owner_prefix FOREIGN KEY (form_own_prefix)
    REFERENCES public.prefixs (id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.form_research_owner
    ADD CONSTRAINT fk_owner_to_plan_form_plan_id FOREIGN KEY (form_own_form_plan_id)
    REFERENCES public.form_research_plan (form_plan_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.form_research_owner
    ADD CONSTRAINT fk_owner_to_util_ownid FOREIGN KEY (form_own_id)
    REFERENCES public.form_utilization (form_own_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.form_research_owner
    ADD CONSTRAINT form_research_owner_form_own_id_fkey FOREIGN KEY (form_own_id)
    REFERENCES public.form_extend (form_own_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.form_research_plan
    ADD CONSTRAINT fk_plan_file_uploads FOREIGN KEY (file_uploads)
    REFERENCES public.file_uploads (fu_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.form_research_plan
    ADD CONSTRAINT fk_plan_prefix FOREIGN KEY (form_plan_prefix)
    REFERENCES public.prefixs (id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.form_research_plan
    ADD CONSTRAINT fk_plan_to_util_planid FOREIGN KEY (form_plan_id)
    REFERENCES public.form_utilization (form_plan_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS uq_research_plan_plan_id
    ON public.form_research_plan(form_plan_id);


ALTER TABLE IF EXISTS public.psu_user_login
    ADD CONSTRAINT fk_psu_user_roles FOREIGN KEY (roles_id)
    REFERENCES public.psu_roles (roles_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.session
    ADD CONSTRAINT session_psu_roles_fk FOREIGN KEY (roles_id)
    REFERENCES public.psu_roles (roles_id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;

END;