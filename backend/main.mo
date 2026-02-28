import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import MixinStorage "blob-storage/Mixin";



actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  let messageIdCounter = Map.singleton<Nat, Nat>(0, 0);
  let ratingIdCounter = Map.singleton<Nat, Nat>(0, 0);
  let loginEventIdCounter = Map.singleton<Nat, Nat>(0, 0);
  let ticketIdCounter = Map.singleton<Nat, Nat>(0, 0);
  let articleIdCounter = Map.singleton<Nat, Nat>(0, 0);
  let commentIdCounter = Map.singleton<Nat, Nat>(0, 0);

  public type Priority = {
    #Low;
    #Medium;
    #High;
    #Critical;
  };

  public type SLA = {
    responseTime : Int;
    resolutionTime : Int;
  };

  public type TicketStatus = {
    #Open;
    #InProgress;
    #Pending;
    #Resolved;
    #Closed;
  };

  public type Attachment = {
    fileType : Text;
    blob : Storage.ExternalBlob;
    message : Text;
    preview : ?Text;
  };

  public type KnowledgeCategory = {
    #PrintersPeripherals;
    #NetworkConnectivity;
    #AccountPasswords;
    #HardwareSupport;
    #SoftwareSupport;
    #GeneralSupport;
    #WindowsSupport;
  };

  public type KBArticle = {
    id : Nat;
    title : Text;
    category : KnowledgeCategory;
    body : Text;
    tags : [Text];
    viewCount : Nat;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Ticket = {
    id : Nat;
    title : Text;
    description : Text;
    priority : Priority;
    status : TicketStatus;
    sla : SLA;
    assignee : Principal;
    requester : Principal;
    messages : [KBComment];
    attachments : [Attachment];
    due : Int;
    createdAt : Int;
    updatedAt : Int;
  };

  public type KBComment = {
    id : Nat;
    author : Principal;
    content : Text;
    createdAt : Int;
    likes : Nat;
  };

  let tickets = Map.empty<Nat, Ticket>();
  let kbArticles = Map.empty<Nat, KBArticle>();
  let comments = Map.empty<Nat, KBComment>();

  let userProfiles = Map.empty<Principal, UserProfile>();
  let loginEvents = Map.empty<Nat, LoginEvent>();
  let messages = Map.empty<Nat, ChatMessage>();
  let supportTickets = Map.empty<Nat, SupportTicket>();
  let paymentRecords = Map.empty<Text, PaymentRecord>();
  let technicianAvailability = Map.empty<Principal, TechnicianAvailability>();
  let chatTranscripts = Map.empty<Nat, ChatTranscript>();
  let chatFeedback = Map.empty<Nat, ChatFeedback>();
  let checkoutSessions = Map.empty<Text, Principal>();
  let completedPayments = Map.empty<Principal, Bool>();

  // Persistent map to track payment toggle state per ticket/session
  let paymentToggleState = Map.empty<Nat, PaymentToggleState>();

  // Maps a messageId to the ticketId it belongs to
  let messageTicketIndex = Map.empty<Nat, Nat>();

  let lastMessageTime = Map.empty<Principal, Int>();
  let lastTicketTime = Map.empty<Principal, Int>();

  var configuration : ?Stripe.StripeConfiguration = null;

  let supportItem : Stripe.ShoppingItem = {
    currency = "USD";
    productName = "Technical Support";
    productDescription = "Access to professional technical support $1 per session";
    priceInCents = 100;
    quantity = 1;
  };

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
    _recordLoginEventInternal(caller, "Admin", "admin@pkgtech.support");
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside AccessControl.assignRole
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    if (profile.displayName.size() == 0 or profile.displayName.size() > 100) {
      Runtime.trap("Invalid profile: Display name must be between 1 and 100 characters");
    };

    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        if (existingProfile.isTechnician != profile.isTechnician and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only admins can change technician status");
        };
      };
      case (null) {
        if (profile.isTechnician and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only admins can create technician profiles");
        };
      };
    };

    userProfiles.add(caller, profile);

    let role = if (profile.isTechnician) { "Technician" } else { "Customer" };
    _recordLoginEventInternal(caller, role, "user@pkgtech.support");
  };

  func _recordLoginEventInternal(user : Principal, role : Text, email : Text) {
    let eventId = _getNextLoginEventId();
    let name = switch (userProfiles.get(user)) {
      case (?p) { p.displayName };
      case (null) { "Unknown User" };
    };

    let event : LoginEvent = {
      name;
      role;
      email;
      timestamp = Time.now();
      principalId = user.toText();
    };

    loginEvents.add(eventId, event);
  };

  func _getNextLoginEventId() : Nat {
    let count = switch (loginEventIdCounter.get(0)) {
      case (null) { 0 };
      case (?i) { i };
    };
    loginEventIdCounter.add(0, count + 1);
    count;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user) {
      if (not AccessControl.isAdmin(accessControlState, caller)) {
        switch (userProfiles.get(caller)) {
          case (?callerProfile) {
            if (callerProfile.isTechnician) {
              if (not hasActiveSupportRelationship(caller, user)) {
                Runtime.trap("Unauthorized: Can only view profiles of customers you are supporting");
              };
            } else {
              Runtime.trap("Unauthorized: Can only view your own profile");
            };
          };
          case (null) {
            Runtime.trap("Unauthorized: Can only view your own profile");
          };
        };
      };
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getLoginEvents() : async [LoginEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view login events");
    };
    loginEvents.values().toArray();
  };

  public query ({ caller }) func getLoginEventsCSV() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can export login events");
    };
    let header = "Name,Role,Email,Timestamp,PrincipalID\n";
    let rows = loginEvents.values().toArray().map(
      func(event : LoginEvent) : Text {
        event.name # "," # event.role # "," # event.email # "," # event.timestamp.toText() # "," # event.principalId
      }
    );
    header # rows.foldLeft("", func(acc, row) { acc # row # "\n" });
  };

  func hasActiveSupportRelationship(user1 : Principal, user2 : Principal) : Bool {
    let allTickets = supportTickets.values().toArray();
    for (ticket in allTickets.vals()) {
      if ((ticket.customer == user1 and ticket.technician == user2) or
          (ticket.customer == user2 and ticket.technician == user1)) {
        switch (ticket.status) {
          case (#open) { return true };
          case (#inProgress) { return true };
          case (#resolved) {
            let dayInNanos = 24 * 60 * 60 * 1_000_000_000;
            if (Time.now() - ticket.updatedAt < dayInNanos) {
              return true;
            };
          };
        };
      };
    };
    false;
  };

  func checkRateLimit(caller : Principal, lastActionMap : Map.Map<Principal, Int>, minIntervalNanos : Int) : Bool {
    switch (lastActionMap.get(caller)) {
      case (null) { true };
      case (?lastTime) {
        Time.now() - lastTime >= minIntervalNanos;
      };
    };
  };

  func updateRateLimit(caller : Principal, lastActionMap : Map.Map<Principal, Int>) {
    lastActionMap.add(caller, Time.now());
  };

  public shared ({ caller }) func sendMessage(
    recipient : Principal,
    content : Text,
    attachment : ?Storage.ExternalBlob
  ) : async MessageStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #failed("Unauthorized: Only users can send messages");
    };

    // Rate limiting: 1 message per second
    if (not checkRateLimit(caller, lastMessageTime, 1_000_000_000)) {
      return #failed("Rate limit exceeded: Please wait before sending another message");
    };

    if (content.size() == 0 and attachment == null) {
      return #failed("Message must contain either text or an attachment");
    };

    if (content.size() > 5000) {
      return #failed("Message content exceeds maximum length of 5000 characters");
    };

    let recipientProfile = userProfiles.get(recipient);

    if (recipientProfile == null) {
      return #failed("Recipient does not exist");
    };

    if (not hasActiveSupportRelationship(caller, recipient)) {
      return #failed("Unauthorized: Can only send messages within active support sessions");
    };

    let messageId : Nat = _getNextMessageId();

    let message : ChatMessage = {
      messageId;
      sender = caller;
      recipient;
      content;
      timestamp = Time.now();
      delivered = false;
      isRead = false;
      attachment;
    };

    messages.add(messageId, message);
    updateRateLimit(caller, lastMessageTime);

    #success;
  };

  public shared ({ caller }) func sendMessageForTicket(
    ticketId : Nat,
    content : Text,
    attachment : ?Storage.ExternalBlob
  ) : async MessageStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #failed("Unauthorized: Only users can send messages");
    };

    // Rate limiting: 1 message per second
    if (not checkRateLimit(caller, lastMessageTime, 1_000_000_000)) {
      return #failed("Rate limit exceeded: Please wait before sending another message");
    };

    if (content.size() == 0 and attachment == null) {
      return #failed("Message must contain either text or an attachment");
    };

    if (content.size() > 5000) {
      return #failed("Message content exceeds maximum length of 5000 characters");
    };

    switch (supportTickets.get(ticketId)) {
      case (null) {
        return #failed("Ticket does not exist");
      };
      case (?ticket) {
        // Only the customer or technician of this ticket can send messages
        if (ticket.customer != caller and ticket.technician != caller) {
          return #failed("Unauthorized: You are not a participant of this ticket");
        };

        // Ticket must be active (open or inProgress)
        switch (ticket.status) {
          case (#resolved) {
            return #failed("Cannot send messages on a resolved ticket");
          };
          case (_) { /* open or inProgress — allowed */ };
        };

        let recipient = if (ticket.customer == caller) { ticket.technician } else { ticket.customer };

        let messageId : Nat = _getNextMessageId();

        let message : ChatMessage = {
          messageId;
          sender = caller;
          recipient;
          content;
          timestamp = Time.now();
          delivered = false;
          isRead = false;
          attachment;
        };

        messages.add(messageId, message);
        // Index this message to the ticket
        messageTicketIndex.add(messageId, ticketId);
        updateRateLimit(caller, lastMessageTime);

        #success;
      };
    };
  };

  func _getNextMessageId() : Nat {
    let count = switch (messageIdCounter.get(0)) {
      case (null) { 0 };
      case (?i) { i };
    };
    messageIdCounter.add(0, count + 1);
    count;
  };

  public query ({ caller }) func getChatMessages(ticketId : Nat) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access chat messages");
    };

    switch (supportTickets.get(ticketId)) {
      case (null) {
        Runtime.trap("Ticket does not exist");
      };
      case (?ticket) {
        // Only the customer, technician, or an admin can read messages for this ticket
        if (ticket.customer != caller and ticket.technician != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You are not a participant of this ticket");
        };

        // Return messages that are either indexed to this ticket OR
        // exchanged between the customer and technician of this ticket
        // (to support legacy messages sent via sendMessage without ticket scoping)
        let customer = ticket.customer;
        let technician = ticket.technician;

        messages.values().toArray().filter(func(msg : ChatMessage) : Bool {
          // Check if message is indexed to this ticket
          switch (messageTicketIndex.get(msg.messageId)) {
            case (?tid) { tid == ticketId };
            case (null) {
              // Fall back: message is between the ticket's customer and technician
              (msg.sender == customer and msg.recipient == technician) or
              (msg.sender == technician and msg.recipient == customer)
            };
          };
        });
      };
    };
  };

  public query ({ caller }) func getMessagesBetweenUsers(user1 : Principal, user2 : Principal) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access messages");
    };
    if (caller != user1 and caller != user2) {
      Runtime.trap("Unauthorized: Can only view messages you are part of");
    };
    messages.values().toArray().filter(func(msg : ChatMessage) : Bool {
      (msg.sender == user1 and msg.recipient == user2) or (msg.sender == user2 and msg.recipient == user1)
    });
  };

  public query ({ caller }) func getUserMessages() : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access messages");
    };
    messages.values().toArray().filter(func(msg : ChatMessage) : Bool {
      msg.sender == caller or msg.recipient == caller
    });
  };

  public query ({ caller }) func getAllMessages() : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    messages.values().toArray();
  };

  public shared ({ caller }) func deleteMessage(messageId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete messages");
    };
    switch (messages.get(messageId)) {
      case (null) {
        Runtime.trap("Message does not exist");
      };
      case (?msg) {
        if (msg.sender != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only message sender or admins can delete a message");
        };

        if (not AccessControl.isAdmin(accessControlState, caller)) {
          let fiveMinutesInNanos = 5 * 60 * 1_000_000_000;
          if (Time.now() - msg.timestamp > fiveMinutesInNanos) {
            Runtime.trap("Unauthorized: Can only delete messages within 5 minutes of sending");
          };
        };

        messages.remove(messageId);
        messageTicketIndex.remove(messageId);
      };
    };
  };

  public shared ({ caller }) func markMessagesAsRead(user1 : Principal, user2 : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };

    if (caller != user1 and caller != user2) {
      Runtime.trap("Unauthorized: Can only mark messages as read in conversations you are part of");
    };

    let userMessagesIter = messages.entries();
    for ((id, msg) in userMessagesIter) {
      if ((msg.sender == user1 and msg.recipient == user2) or (msg.sender == user2 and msg.recipient == user1)) {
        if (msg.recipient == caller) {
          let updatedMessage : ChatMessage = {
            messageId = msg.messageId;
            sender = msg.sender;
            recipient = msg.recipient;
            content = msg.content;
            timestamp = msg.timestamp;
            delivered = msg.delivered;
            isRead = true;
            attachment = msg.attachment;
          };
          messages.add(id, updatedMessage);
        };
      };
    };
  };

  public shared ({ caller }) func markTicketMessagesAsRead(ticketId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };

    switch (supportTickets.get(ticketId)) {
      case (null) {
        Runtime.trap("Ticket does not exist");
      };
      case (?ticket) {
        if (ticket.customer != caller and ticket.technician != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You are not a participant of this ticket");
        };

        let customer = ticket.customer;
        let technician = ticket.technician;

        let allMessages = messages.entries();
        for ((id, msg) in allMessages) {
          let belongsToTicket = switch (messageTicketIndex.get(msg.messageId)) {
            case (?tid) { tid == ticketId };
            case (null) {
              (msg.sender == customer and msg.recipient == technician) or
              (msg.sender == technician and msg.recipient == customer)
            };
          };

          if (belongsToTicket and msg.recipient == caller and not msg.isRead) {
            let updatedMessage : ChatMessage = {
              messageId = msg.messageId;
              sender = msg.sender;
              recipient = msg.recipient;
              content = msg.content;
              timestamp = msg.timestamp;
              delivered = msg.delivered;
              isRead = true;
              attachment = msg.attachment;
            };
            messages.add(id, updatedMessage);
          };
        };
      };
    };
  };

  public shared ({ caller }) func submitRating(rating : Int, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit ratings");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Invalid rating: Must be between 1 and 5");
    };

    if (comment.size() > 1000) {
      Runtime.trap("Comment exceeds maximum length of 1000 characters");
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.isTechnician) {
          Runtime.trap("Unauthorized: Technicians cannot submit ratings for their own sessions");
        };
      };
      case (null) { /* Allow if no profile exists */ };
    };

    let userTickets = supportTickets.values().toArray().filter(func(ticket : SupportTicket) : Bool {
      ticket.customer == caller and (ticket.status == #resolved)
    });

    if (userTickets.size() == 0) {
      Runtime.trap("You must have a resolved support session to submit a rating");
    };

    let ratingId : Nat = _getNextRatingId();

    let ratingData : ChatFeedback = {
      sessionId = ratingId;
      customer = caller;
      rating;
      comment;
      submittedAt = Time.now();
    };

    chatFeedback.add(ratingId, ratingData);
  };

  public query ({ caller }) func getChatFeedback(sessionId : Nat) : async ?ChatFeedback {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access feedback");
    };
    switch (chatFeedback.get(sessionId)) {
      case (null) { null };
      case (?feedback) {
        if (feedback.customer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own feedback");
        };
        ?feedback;
      };
    };
  };

  func _getNextRatingId() : Nat {
    let count = switch (ratingIdCounter.get(0)) {
      case (null) { 0 };
      case (?i) { i };
    };
    ratingIdCounter.add(0, count + 1);
    count;
  };

  public query func isStripeConfigured() : async Bool {
    configuration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    configuration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };

    switch (checkoutSessions.get(sessionId)) {
      case (null) {
        Runtime.trap("Unauthorized: Invalid session");
      };
      case (?owner) {
        if (owner != caller) {
          Runtime.trap("Unauthorized: Invalid session");
        };
      };
    };

    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createSupportCheckoutSession(successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.isTechnician) {
          Runtime.trap("Unauthorized: Technicians cannot create payment sessions");
        };
      };
      case (null) { /* Allow if no profile exists */ };
    };

    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, [supportItem], successUrl, cancelUrl, transform);
    checkoutSessions.add(sessionId, caller);
    sessionId;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
    checkoutSessions.add(sessionId, caller);
    sessionId;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createPaymentRecord(paymentId : Text, amount : Nat, currency : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create payment records");
    };

    switch (paymentRecords.get(paymentId)) {
      case (?existing) {
        Runtime.trap("Payment record already exists");
      };
      case (null) { /* OK to create */ };
    };

    switch (checkoutSessions.get(paymentId)) {
      case (null) {
        Runtime.trap("Payment session not found");
      };
      case (?customer) {
        let record : PaymentRecord = {
          paymentId;
          customer;
          amount;
          currency;
          status = #pending;
          timestamp = Time.now();
        };
        paymentRecords.add(paymentId, record);
      };
    };
  };

  public shared ({ caller }) func updatePaymentStatus(paymentId : Text, status : PaymentStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payment status");
    };

    switch (paymentRecords.get(paymentId)) {
      case (null) {
        Runtime.trap("Failed to update payment status. Payment does not exist");
      };
      case (?record) {
        let updatedRecord : PaymentRecord = {
          paymentId = record.paymentId;
          customer = record.customer;
          amount = record.amount;
          currency = record.currency;
          status;
          timestamp = record.timestamp;
        };

        paymentRecords.add(paymentId, updatedRecord);

        switch (status) {
          case (#completed) {
            completedPayments.add(record.customer, true);
          };
          case (_) { /* No action needed */ };
        };
      };
    };
  };

  public query ({ caller }) func getPaymentRecord(paymentId : Text) : async ?PaymentRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access payment records");
    };

    switch (paymentRecords.get(paymentId)) {
      case (null) { null };
      case (?record) {
        if (record.customer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own payment records");
        };
        ?record;
      };
    };
  };

  func hasCompletedPayment(customer : Principal) : Bool {
    switch (completedPayments.get(customer)) {
      case (?true) { true };
      case (_) { false };
    };
  };

  public shared ({ caller }) func createSupportTicket(technician : Principal) : async SupportTicket {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create support tickets");
    };

    if (not checkRateLimit(caller, lastTicketTime, 5 * 60 * 1_000_000_000)) {
      Runtime.trap("Rate limit exceeded: Please wait before creating another ticket");
    };

    switch (userProfiles.get(caller)) {
      case (?callerProfile) {
        if (callerProfile.isTechnician) {
          Runtime.trap("Unauthorized: Technicians cannot create support tickets as customers");
        };
      };
      case (null) { /* Allow if no profile exists yet */ };
    };

    if (not hasCompletedPayment(caller)) {
      Runtime.trap("Unauthorized: Payment must be completed before creating a support ticket");
    };

    switch (userProfiles.get(technician)) {
      case (null) {
        Runtime.trap("Technician does not exist");
      };
      case (?profile) {
        if (not profile.isTechnician) {
          Runtime.trap("Specified user is not a technician");
        };
      };
    };

    switch (technicianAvailability.get(technician)) {
      case (null) {
        Runtime.trap("Technician availability status unknown");
      };
      case (?availability) {
        if (not availability.isAvailable) {
          Runtime.trap("Technician is not currently available");
        };
      };
    };

    let ticketId = supportTickets.size();
    let ticket : SupportTicket = {
      ticketId;
      customer = caller;
      technician;
      status = #open;
      messages = [];
      feedback = null;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    supportTickets.add(ticketId, ticket);
    updateRateLimit(caller, lastTicketTime);
    ticket;
  };

  public shared ({ caller }) func addTicketFeedback(ticketId : Nat, rating : Nat, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add feedback");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Invalid rating: Must be between 1 and 5");
    };

    if (comment.size() > 1000) {
      Runtime.trap("Comment exceeds maximum length of 1000 characters");
    };

    switch (supportTickets.get(ticketId)) {
      case (null) {
        Runtime.trap("Failed to add feedback. Ticket does not exist");
      };
      case (?ticket) {
        if (ticket.customer != caller) {
          Runtime.trap("Unauthorized: Only the ticket customer can add feedback");
        };

        if (ticket.status != #resolved) {
          Runtime.trap("Cannot add feedback to a ticket that is not resolved");
        };

        switch (ticket.feedback) {
          case (?existing) {
            Runtime.trap("Feedback already submitted for this ticket");
          };
          case (null) { /* OK to add */ };
        };

        let updatedFeedback = ?{ rating; comment };

        let updatedTicket : SupportTicket = {
          ticketId = ticket.ticketId;
          customer = ticket.customer;
          technician = ticket.technician;
          status = ticket.status;
          messages = ticket.messages;
          feedback = updatedFeedback;
          createdAt = ticket.createdAt;
          updatedAt = Time.now();
        };

        supportTickets.add(ticketId, updatedTicket);
      };
    };
  };

  // updateTicketStatus: customers can reopen resolved tickets,
  // technicians and admins can update to any status.
  public shared ({ caller }) func updateTicketStatus(ticketId : Nat, status : TicketStatusOld) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tickets");
    };

    switch (supportTickets.get(ticketId)) {
      case (null) {
        Runtime.trap("Failed to update ticket. Ticket does not exist");
      };
      case (?ticket) {
        // Only ticket participants (customer or technician) or admins can update
        if (ticket.customer != caller and ticket.technician != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only ticket participants can update tickets");
        };

        let updatedTicket : SupportTicket = {
          ticketId = ticket.ticketId;
          customer = ticket.customer;
          technician = ticket.technician;
          status;
          messages = ticket.messages;
          feedback = ticket.feedback;
          createdAt = ticket.createdAt;
          updatedAt = Time.now();
        };

        supportTickets.add(ticketId, updatedTicket);
      };
    };
  };

  public shared ({ caller }) func assignTechnician(ticketId : Nat, technician : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reassign tickets");
    };

    switch (supportTickets.get(ticketId)) {
      case (null) {
        Runtime.trap("Failed to assign technician. Ticket does not exist");
      };
      case (?ticket) {
        switch (userProfiles.get(technician)) {
          case (null) {
            Runtime.trap("Technician does not exist");
          };
          case (?profile) {
            if (not profile.isTechnician) {
              Runtime.trap("Specified user is not a technician");
            };
          };
        };

        let updatedTicket : SupportTicket = {
          ticketId = ticket.ticketId;
          customer = ticket.customer;
          technician;
          status = ticket.status;
          messages = ticket.messages;
          feedback = ticket.feedback;
          createdAt = ticket.createdAt;
          updatedAt = Time.now();
        };

        supportTickets.add(ticketId, updatedTicket);
      };
    };
  };

  public query ({ caller }) func getUserTickets() : async [SupportTicket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access support tickets");
    };
    supportTickets.values().toArray().filter(func(ticket : SupportTicket) : Bool {
      ticket.customer == caller or ticket.technician == caller
    });
  };

  public query ({ caller }) func getTicket(ticketId : Nat) : async ?SupportTicket {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access support tickets");
    };

    switch (supportTickets.get(ticketId)) {
      case (null) { null };
      case (?ticket) {
        if (ticket.customer != caller and ticket.technician != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view tickets you are part of");
        };
        ?ticket;
      };
    };
  };

  public query ({ caller }) func getAdminTickets() : async [SupportTicket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all tickets");
    };
    supportTickets.values().toArray();
  };

  public query ({ caller }) func getAllAvailableTechnicians() : async [TechnicianAvailability] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view available technicians");
    };

    technicianAvailability.values().toArray();
  };

  public shared ({ caller }) func setTechnicianAvailability(isAvailable : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update technician availability");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile not found. Please create a profile first")
      };
      case (?profile) {
        if (not profile.isTechnician) {
          Runtime.trap("Unauthorized: Only technicians can set their availability");
        };

        let availability : TechnicianAvailability = {
          technician = caller;
          isAvailable;
          lastUpdated = Time.now();
        };

        technicianAvailability.add(caller, availability);
      };
    };
  };

  public query ({ caller }) func getTechnicianAvailability(technician : Principal) : async ?TechnicianAvailability {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view technician availability");
    };
    technicianAvailability.get(technician);
  };

  public shared ({ caller }) func setAllTechniciansOffline() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update technician availability");
    };

    let maps = technicianAvailability.toArray();
    for ((techPrincipal, availability) in maps.vals()) {
      if (availability.isAvailable) {
        let updatedAvailability : TechnicianAvailability = {
          technician = availability.technician;
          isAvailable = false;
          lastUpdated = Time.now();
        };
        technicianAvailability.add(techPrincipal, updatedAvailability);
      };
    };
  };

  // Knowledge Base functions
  // createKBArticle: admin-only — KB articles are managed content, not user-generated.
  public shared ({ caller }) func createKBArticle(
    title : Text,
    category : KnowledgeCategory,
    body : Text,
    tags : [Text],
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create knowledge base articles");
    };

    let articleId = getNextArticleId();
    let article : KBArticle = {
      id = articleId;
      title;
      category;
      body;
      tags;
      viewCount = 0;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    kbArticles.add(articleId, article);
  };

  // updateKBArticle: admin-only
  public shared ({ caller }) func updateKBArticle(
    articleId : Nat,
    title : Text,
    category : KnowledgeCategory,
    body : Text,
    tags : [Text],
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update knowledge base articles");
    };

    switch (kbArticles.get(articleId)) {
      case (null) {
        Runtime.trap("Article not found");
      };
      case (?article) {
        let updatedArticle : KBArticle = {
          id = article.id;
          title;
          category;
          body;
          tags;
          viewCount = article.viewCount;
          createdAt = article.createdAt;
          updatedAt = Time.now();
        };
        kbArticles.add(articleId, updatedArticle);
      };
    };
  };

  // deleteKBArticle: admin-only
  public shared ({ caller }) func deleteKBArticle(articleId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete knowledge base articles");
    };

    switch (kbArticles.get(articleId)) {
      case (null) {
        Runtime.trap("Article not found");
      };
      case (?_) {
        kbArticles.remove(articleId);
      };
    };
  };

  // incrementArticleViewCount: open to all (no auth required — public KB self-service)
  public shared ({ caller }) func incrementArticleViewCount(articleId : Nat) : async () {
    switch (kbArticles.get(articleId)) {
      case (null) {
        Runtime.trap("Article not found");
      };
      case (?article) {
        let updatedArticle = {
          id = article.id;
          title = article.title;
          category = article.category;
          body = article.body;
          tags = article.tags;
          viewCount = article.viewCount + 1;
          createdAt = article.createdAt;
          updatedAt = article.updatedAt;
        };
        kbArticles.add(articleId, updatedArticle);
      };
    };
  };

  func getNextArticleId() : Nat {
    let count = switch (articleIdCounter.get(0)) {
      case (null) { 0 };
      case (?i) { i };
    };
    articleIdCounter.add(0, count + 1);
    count;
  };

  // searchKBArticles: open to all (public self-service KB)
  public query func searchKBArticles(searchTerm : Text) : async [KBArticle] {
    let lowerTerm = searchTerm.toLower();
    let iter = kbArticles.values();
    let articlesList = iter.toList<KBArticle>();

    let searchResultsIter = articlesList.values().filter(
      func(article) {
        article.body.toLower().contains(#text lowerTerm) or
        article.title.toLower().contains(#text lowerTerm)
      }
    );
    searchResultsIter.toArray();
  };

  // getArticlesByCategory: open to all (public self-service KB)
  public query func getArticlesByCategory(category : KnowledgeCategory) : async [KBArticle] {
    let iter = kbArticles.values();
    let articlesList = iter.toList<KBArticle>();

    let filteredArticlesIter = articlesList.values().filter(
      func(article) { article.category == category }
    );
    filteredArticlesIter.toArray();
  };

  // getAllKBArticles: open to all (public self-service KB)
  public query func getAllKBArticles() : async [KBArticle] {
    kbArticles.values().toArray();
  };

  // getKBArticle: open to all (public self-service KB)
  public query func getKBArticle(articleId : Nat) : async ?KBArticle {
    kbArticles.get(articleId);
  };

  // Analytics: admin/technician only
  public query ({ caller }) func getAnalyticsMetrics() : async {
    totalTickets : Nat;
    openTickets : Nat;
    resolvedTickets : Nat;
    resolutionRate : Nat;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      // Also allow technicians
      switch (userProfiles.get(caller)) {
        case (?profile) {
          if (not profile.isTechnician) {
            Runtime.trap("Unauthorized: Only admins and technicians can view analytics");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: Only admins and technicians can view analytics");
        };
      };
    };

    let allTickets = supportTickets.values().toArray();
    let total = allTickets.size();
    let resolved = allTickets.filter(func(t : SupportTicket) : Bool { t.status == #resolved }).size();
    let open = allTickets.filter(func(t : SupportTicket) : Bool { t.status == #open or t.status == #inProgress }).size();
    let rate = if (total == 0) { 0 } else { (resolved * 100) / total };

    {
      totalTickets = total;
      openTickets = open;
      resolvedTickets = resolved;
      resolutionRate = rate;
    };
  };

  // Persistent Fields for Payment Toggle State
  public type PaymentToggleState = {
    toggleEnabled : Bool;
    paymentRequested : Bool;
    stripeSessionId : ?Text;
    customer : Principal;
    technician : Principal;
    active : Bool;
  };

  // Payment Toggle Type aliases
  public type ToggleStatus = {
    #enabled;
    #disabled;
    #notRequested;
  };

  public type UserProfile = {
    displayName : Text;
    isTechnician : Bool;
    avatar : ?Storage.ExternalBlob;
  };

  public type LoginEvent = {
    name : Text;
    role : Text;
    email : Text;
    timestamp : Int;
    principalId : Text;
  };

  public type ChatMessage = {
    messageId : Nat;
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Int;
    delivered : Bool;
    isRead : Bool;
    attachment : ?Storage.ExternalBlob;
  };

  public type TicketStatusOld = {
    #open;
    #inProgress;
    #resolved;
  };

  public type SupportTicket = {
    ticketId : Nat;
    customer : Principal;
    technician : Principal;
    status : TicketStatusOld;
    messages : [ChatMessage];
    feedback : ?{ rating : Nat; comment : Text };
    createdAt : Int;
    updatedAt : Int;
  };

  public type PaymentRecord = {
    paymentId : Text;
    customer : Principal;
    amount : Nat;
    currency : Text;
    status : PaymentStatus;
    timestamp : Int;
  };

  public type PaymentStatus = {
    #pending;
    #completed;
    #failed;
  };

  public type TechnicianAvailability = {
    technician : Principal;
    isAvailable : Bool;
    lastUpdated : Int;
  };

  public type MessageStatus = {
    #success;
    #failed : Text;
  };

  public type ChatTranscript = {
    customer : Principal;
    technician : ?Principal;
    messages : [ChatMessage];
    createdAt : Int;
    endedAt : Int;
  };

  public type ChatFeedback = {
    sessionId : Nat;
    customer : Principal;
    rating : Int;
    comment : Text;
    submittedAt : Int;
  };

  public type ChatSession = {
    customer : Principal;
    publicMessages : [ChatMessage];
    privateMessages : [ChatMessage];
  };

  // Helper: verify caller is a technician (has #user permission and isTechnician profile flag)
  func validateTechnician(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile not found. Please create a profile first")
      };
      case (?profile) {
        if (not profile.isTechnician) {
          Runtime.trap("Unauthorized: Only technicians can perform this action");
        };
      };
    };
  };

  // Helper: verify caller is the technician of the given ticket
  func validateTicketTechnician(caller : Principal, ticketId : Nat) {
    validateTechnician(caller);
    switch (supportTickets.get(ticketId)) {
      case (null) {
        Runtime.trap("Ticket does not exist");
      };
      case (?ticket) {
        if (ticket.technician != caller) {
          Runtime.trap("Unauthorized: Only the assigned technician can perform this action on this ticket");
        };
      };
    };
  };

  // Set payment toggle state - only the assigned technician of the ticket may call this
  public shared ({ caller }) func setToggleState(
    ticketId : Nat,
    toggleEnabled : Bool,
    paymentRequested : Bool,
    stripeSessionId : ?Text
  ) : async () {
    // Verify caller is a technician and is the assigned technician for this ticket
    validateTicketTechnician(caller, ticketId);

    switch (supportTickets.get(ticketId)) {
      case (null) {
        Runtime.trap("Ticket does not exist");
      };
      case (?ticket) {
        let state : PaymentToggleState = {
          toggleEnabled;
          paymentRequested;
          stripeSessionId;
          customer = ticket.customer;
          technician = caller;
          active = toggleEnabled;
        };
        paymentToggleState.add(ticketId, state);
      };
    };
  };

  // Get payment toggle state for a ticket - only ticket participants (customer or technician) or admins
  public query ({ caller }) func getToggleState(ticketId : Nat) : async ?PaymentToggleState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access payment toggle state");
    };

    switch (supportTickets.get(ticketId)) {
      case (null) {
        Runtime.trap("Ticket does not exist");
      };
      case (?ticket) {
        if (ticket.customer != caller and ticket.technician != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only ticket participants can view payment toggle state");
        };
        paymentToggleState.get(ticketId);
      };
    };
  };

  // Get persistent payment toggle status for UI - only ticket participants or admins
  public query ({ caller }) func getPersistentToggleState(ticketId : Nat) : async ToggleStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access payment toggle state");
    };

    switch (supportTickets.get(ticketId)) {
      case (null) {
        Runtime.trap("Ticket does not exist");
      };
      case (?ticket) {
        if (ticket.customer != caller and ticket.technician != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only ticket participants can view payment toggle state");
        };
        switch (paymentToggleState.get(ticketId)) {
          case (?state) {
            if (state.toggleEnabled) { #enabled } else { #disabled };
          };
          case (null) { #notRequested };
        };
      };
    };
  };

  // End chat session explicitly - only the assigned technician of the ticket may call this
  public shared ({ caller }) func endChatSession(ticketId : Nat) : async () {
    validateTicketTechnician(caller, ticketId);

    switch (paymentToggleState.get(ticketId)) {
      case (?state) {
        paymentToggleState.add(
          ticketId,
          {
            toggleEnabled = state.toggleEnabled;
            paymentRequested = state.paymentRequested;
            stripeSessionId = state.stripeSessionId;
            customer = state.customer;
            technician = state.technician;
            active = false;
          },
        );
      };
      case (null) {
        Runtime.trap("No chat session found for this ticket");
      };
    };
  };

  // Premium Chat Tiers
  public type ChatTier = {
    #basic;
    #premium;
    #sponsorship;
  };

  // Get available chat tiers - open to all authenticated users
  public query ({ caller }) func getAvailableTiers() : async [ChatTier] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view available tiers");
    };
    [#basic, #premium, #sponsorship];
  };

  // Update tier selection state - only ticket participants
  public query ({ caller }) func updateTierSelection(ticketId : Nat, tier : ChatTier) : async ChatTier {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tier selection");
    };
    switch (supportTickets.get(ticketId)) {
      case (null) {
        Runtime.trap("Ticket does not exist");
      };
      case (?ticket) {
        if (ticket.customer != caller and ticket.technician != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only ticket participants can update tier selection");
        };
        tier;
      };
    };
  };

  public query ({ caller }) func tierSelectionInfo(
    ticketId : Nat,
    tier : ChatTier,
    paymentStatus : Bool,
  ) : async {
    tier : ChatTier;
    paymentStatus : Bool;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tier selection info");
    };
    switch (supportTickets.get(ticketId)) {
      case (null) {
        Runtime.trap("Ticket does not exist");
      };
      case (?ticket) {
        if (ticket.customer != caller and ticket.technician != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only ticket participants can view tier selection info");
        };
        {
          tier;
          paymentStatus;
        };
      };
    };
  };

  // Get supported currencies - open to all authenticated users
  public query ({ caller }) func getSupportedCurrencies() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view supported currencies");
    };
    ["USD", "EUR", "GBP"];
  };
};
