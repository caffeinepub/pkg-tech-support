import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    displayName: string;
    isTechnician: boolean;
    avatar?: ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PaymentToggleState {
    technician: Principal;
    active: boolean;
    toggleEnabled: boolean;
    customer: Principal;
    paymentRequested: boolean;
    stripeSessionId?: string;
}
export interface KBArticle {
    id: bigint;
    title: string;
    body: string;
    createdAt: bigint;
    tags: Array<string>;
    updatedAt: bigint;
    viewCount: bigint;
    category: KnowledgeCategory;
}
export interface PaymentRecord {
    status: PaymentStatus;
    customer: Principal;
    currency: string;
    paymentId: string;
    timestamp: bigint;
    amount: bigint;
}
export interface LoginEvent {
    name: string;
    role: string;
    email: string;
    timestamp: bigint;
    principalId: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ChatFeedback {
    customer: Principal;
    submittedAt: bigint;
    comment: string;
    sessionId: bigint;
    rating: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type MessageStatus = {
    __kind__: "success";
    success: null;
} | {
    __kind__: "failed";
    failed: string;
};
export interface ChatMessage {
    content: string;
    messageId: bigint;
    recipient: Principal;
    isRead: boolean;
    sender: Principal;
    timestamp: bigint;
    delivered: boolean;
    attachment?: ExternalBlob;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface TechnicianAvailability {
    technician: Principal;
    lastUpdated: bigint;
    isAvailable: boolean;
}
export interface SupportTicket {
    status: TicketStatusOld;
    technician: Principal;
    customer: Principal;
    messages: Array<ChatMessage>;
    createdAt: bigint;
    feedback?: {
        comment: string;
        rating: bigint;
    };
    ticketId: bigint;
    updatedAt: bigint;
}
export enum ChatTier {
    sponsorship = "sponsorship",
    premium = "premium",
    basic = "basic"
}
export enum KnowledgeCategory {
    NetworkConnectivity = "NetworkConnectivity",
    AccountPasswords = "AccountPasswords",
    GeneralSupport = "GeneralSupport",
    WindowsSupport = "WindowsSupport",
    SoftwareSupport = "SoftwareSupport",
    HardwareSupport = "HardwareSupport",
    PrintersPeripherals = "PrintersPeripherals"
}
export enum PaymentStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum TicketStatusOld {
    resolved = "resolved",
    open = "open",
    inProgress = "inProgress"
}
export enum ToggleStatus {
    disabled = "disabled",
    enabled = "enabled",
    notRequested = "notRequested"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTicketFeedback(ticketId: bigint, rating: bigint, comment: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignTechnician(ticketId: bigint, technician: Principal): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createKBArticle(title: string, category: KnowledgeCategory, body: string, tags: Array<string>): Promise<void>;
    createPaymentRecord(paymentId: string, amount: bigint, currency: string): Promise<void>;
    createSupportCheckoutSession(successUrl: string, cancelUrl: string): Promise<string>;
    createSupportTicket(technician: Principal): Promise<SupportTicket>;
    deleteKBArticle(articleId: bigint): Promise<void>;
    deleteMessage(messageId: bigint): Promise<void>;
    endChatSession(ticketId: bigint): Promise<void>;
    getAdminTickets(): Promise<Array<SupportTicket>>;
    getAllAvailableTechnicians(): Promise<Array<TechnicianAvailability>>;
    getAllKBArticles(): Promise<Array<KBArticle>>;
    getAllMessages(): Promise<Array<ChatMessage>>;
    getAnalyticsMetrics(): Promise<{
        resolutionRate: bigint;
        resolvedTickets: bigint;
        openTickets: bigint;
        totalTickets: bigint;
    }>;
    getArticlesByCategory(category: KnowledgeCategory): Promise<Array<KBArticle>>;
    getAvailableTiers(): Promise<Array<ChatTier>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatFeedback(sessionId: bigint): Promise<ChatFeedback | null>;
    getChatMessages(ticketId: bigint): Promise<Array<ChatMessage>>;
    getKBArticle(articleId: bigint): Promise<KBArticle | null>;
    getLoginEvents(): Promise<Array<LoginEvent>>;
    getLoginEventsCSV(): Promise<string>;
    getMessagesBetweenUsers(user1: Principal, user2: Principal): Promise<Array<ChatMessage>>;
    getPaymentRecord(paymentId: string): Promise<PaymentRecord | null>;
    getPersistentToggleState(ticketId: bigint): Promise<ToggleStatus>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSupportedCurrencies(): Promise<Array<string>>;
    getTechnicianAvailability(technician: Principal): Promise<TechnicianAvailability | null>;
    getTicket(ticketId: bigint): Promise<SupportTicket | null>;
    getToggleState(ticketId: bigint): Promise<PaymentToggleState | null>;
    getUserMessages(): Promise<Array<ChatMessage>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTickets(): Promise<Array<SupportTicket>>;
    incrementArticleViewCount(articleId: bigint): Promise<void>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markMessagesAsRead(user1: Principal, user2: Principal): Promise<void>;
    markTicketMessagesAsRead(ticketId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchKBArticles(searchTerm: string): Promise<Array<KBArticle>>;
    sendMessage(recipient: Principal, content: string, attachment: ExternalBlob | null): Promise<MessageStatus>;
    sendMessageForTicket(ticketId: bigint, content: string, attachment: ExternalBlob | null): Promise<MessageStatus>;
    setAllTechniciansOffline(): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setTechnicianAvailability(isAvailable: boolean): Promise<void>;
    setToggleState(ticketId: bigint, toggleEnabled: boolean, paymentRequested: boolean, stripeSessionId: string | null): Promise<void>;
    submitRating(rating: bigint, comment: string): Promise<void>;
    tierSelectionInfo(ticketId: bigint, tier: ChatTier, paymentStatus: boolean): Promise<{
        paymentStatus: boolean;
        tier: ChatTier;
    }>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateKBArticle(articleId: bigint, title: string, category: KnowledgeCategory, body: string, tags: Array<string>): Promise<void>;
    updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void>;
    updateTicketStatus(ticketId: bigint, status: TicketStatusOld): Promise<void>;
    updateTierSelection(ticketId: bigint, tier: ChatTier): Promise<ChatTier>;
}
